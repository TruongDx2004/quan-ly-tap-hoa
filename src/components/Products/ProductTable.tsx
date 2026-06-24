import { useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
  Popconfirm,
  Tooltip,
  Typography,
  Input,
  Switch,
  Badge,
  Select,
  Flex,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useProducts, useDeleteProduct } from '../../hooks/useProducts'
import { ProductFormModal } from './ProductFormModal'
import type { Product } from '../../types'
import { formatCurrency } from '../../lib/format'
import { PRODUCT_CATEGORIES } from '../../lib/constants'

const { Text } = Typography
const LOW_STOCK_THRESHOLD = 5

export function ProductTable() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Tất cả')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useProducts(search, category)
  const deleteProduct = useDeleteProduct()

  const filtered = lowStockOnly
    ? products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD)
    : products

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id)
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 64,
      render: (url: string | null) =>
        url ? (
          <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              background: '#f0f0f0',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            📦
          </div>
        ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.barcode && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              📷 {record.barcode}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (cat: string) => <Tag color="blue">{cat || 'Khác'}</Tag>,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: 120,
      render: (cost: number | null) =>
        cost != null ? (
          <Text type="secondary">{formatCurrency(cost)}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty: number, record: Product) => {
        const displayQty = qty % 1 === 0 ? qty : qty.toFixed(2)
        const displayUnit = record.unit || 'cái'
        return qty < LOW_STOCK_THRESHOLD ? (
          <Badge dot>
            <Tag color="red" icon={<WarningOutlined />}>
              {displayQty} {displayUnit} {qty === 0 ? '(Hết)' : '(Sắp hết)'}
            </Tag>
          </Badge>
        ) : (
          <Tag color="green">
            {displayQty} {displayUnit}
          </Tag>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: Product) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa sản phẩm?"
              description="Thao tác này không thể hoàn tác."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteProduct.isPending}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Flex vertical style={{ width: '100%' }} gap={12}>
      {/* Toolbar */}
      <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            value={category}
            onChange={setCategory}
            style={{ width: 180 }}
            options={[
              { value: 'Tất cả', label: '📁 Tất cả danh mục' },
              ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Space>
            <Switch
              checked={lowStockOnly}
              onChange={setLowStockOnly}
              checkedChildren={<WarningOutlined />}
              unCheckedChildren={<WarningOutlined />}
            />
            <Text type="secondary">Chỉ hiện sắp hết</Text>
          </Space>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm sản phẩm
        </Button>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `Tổng ${t} sản phẩm` }}
        size="middle"
        scroll={{ x: 700 }}
      />

      {/* Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
      />
    </Flex>
  )
}
