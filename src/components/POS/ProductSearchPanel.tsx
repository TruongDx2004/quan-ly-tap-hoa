import { useState, useRef, useEffect } from 'react'
import {
  Input,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Empty,
  Tabs,
  Modal,
  Button,
  Grid,
} from 'antd'
import type { InputRef } from 'antd'
import { SearchOutlined, BarcodeOutlined } from '@ant-design/icons'
import { useProducts } from '../../hooks/useProducts'
import { useCartStore } from '../../stores/cartStore'
import type { Product } from '../../types'
import { formatCurrency } from '../../lib/format'
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from '../../lib/constants'

const { Text } = Typography

export function ProductSearchPanel() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tất cả')
  const [selectedProductForUnit, setSelectedProductForUnit] = useState<Product | null>(null)
  const { data: products = [], isLoading } = useProducts(search, category)
  const addToCart = useCartStore((s) => s.addToCart)
  const inputRef = useRef<InputRef>(null)
  
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && products.length === 1) {
      const matchedProduct = products[0]
      const term = search.trim()

      // Kiểm tra xem barcode quét được có trùng khớp với đơn vị phụ nào không
      const matchedSubUnit = matchedProduct.product_units?.find((u) => u.barcode === term)

      if (matchedSubUnit) {
        // Thêm thẳng đơn vị quy đổi phụ tương ứng
        addToCart(matchedProduct, {
          name: matchedSubUnit.unit_name,
          price: matchedSubUnit.price,
          ratio: Number(matchedSubUnit.ratio),
        })
        setSearch('')
      } else if (matchedProduct.product_units && matchedProduct.product_units.length > 0) {
        // Có nhiều đơn vị tính → hiện popup chọn
        setSelectedProductForUnit(matchedProduct)
      } else {
        // Chỉ có đơn vị cơ bản
        addToCart(matchedProduct)
        setSearch('')
      }
    }
  }

  const handleProductClick = (product: Product) => {
    if (product.product_units && product.product_units.length > 0) {
      setSelectedProductForUnit(product)
    } else {
      addToCart(product)
      setSearch('')
      inputRef.current?.focus()
    }
  }

  const tabItems = [
    { key: 'Tất all', label: '📁 Tất cả', children: null },
    ...PRODUCT_CATEGORIES.map((c) => ({
      key: c,
      label: `${CATEGORY_ICONS[c] || '📦'} ${c}`,
      children: null,
    })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Category Tabs */}
      <Tabs
        activeKey={category === 'Tất cả' ? 'Tất all' : category}
        onChange={(key) => setCategory(key === 'Tất all' ? 'Tất cả' : key)}
        items={tabItems}
        size="small"
        style={{ marginBottom: 0 }}
      />

      {/* Search Bar */}
      <Input
        ref={inputRef}
        size={isMobile ? undefined : 'large'}
        prefix={<SearchOutlined />}
        suffix={<BarcodeOutlined style={{ color: '#aaa' }} />}
        placeholder="Tìm tên hoặc quét barcode, nhấn Enter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        allowClear
        style={{ fontSize: isMobile ? 13 : 15 }}
      />

      {/* Product Grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <Empty description="Không tìm thấy sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[10, 10]}>
            {products.map((product) => (
              <Col key={product.id} xs={12} sm={8} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  onClick={() => handleProductClick(product)}
                  size="small"
                  style={{
                    cursor: 'pointer',
                    border: product.quantity === 0 ? '1px solid #ff4d4f' : '1px solid #f0f0f0',
                    opacity: product.quantity === 0 ? 0.65 : 1,
                    userSelect: 'none',
                  }}
                  cover={
                    product.image_url ? (
                      <img
                        alt={product.name}
                        src={product.image_url}
                        style={{ height: isMobile ? 70 : 90, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: isMobile ? 70 : 90,
                          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isMobile ? 24 : 32,
                        }}
                      >
                        📦
                      </div>
                    )
                  }
                  styles={{ body: { padding: '8px 10px' } }}
                >
                  <Text
                    strong
                    ellipsis={{ tooltip: product.name }}
                    style={{ display: 'block', fontSize: 13, lineHeight: '1.3' }}
                  >
                    {product.name}
                  </Text>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <Text style={{ color: '#1677ff', fontWeight: 600, fontSize: 13 }}>
                      {formatCurrency(product.price)}
                    </Text>
                    <Tag
                      color={product.quantity === 0 ? 'red' : product.quantity < 5 ? 'warning' : 'success'}
                      style={{ fontSize: 10, margin: 0, padding: '0 4px' }}
                    >
                      {product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(2)} {product.unit || 'cái'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Popup Chọn Đơn Vị Quy Đổi */}
      <Modal
        title={
          <span style={{ fontSize: 16 }}>
            📦 Chọn đơn vị bán: <strong>{selectedProductForUnit?.name}</strong>
          </span>
        }
        open={!!selectedProductForUnit}
        onCancel={() => setSelectedProductForUnit(null)}
        footer={null}
        width={400}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
          {selectedProductForUnit && (
            <Button
              size="large"
              onClick={() => {
                addToCart(selectedProductForUnit)
                setSelectedProductForUnit(null)
                setSearch('')
                inputRef.current?.focus()
              }}
              style={{
                height: 52,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong>{selectedProductForUnit.unit} (Cơ bản)</Text>
              <Text type="success" strong>
                {formatCurrency(selectedProductForUnit.price)}
              </Text>
            </Button>
          )}

          {selectedProductForUnit?.product_units?.map((u) => (
            <Button
              key={u.id}
              size="large"
              onClick={() => {
                addToCart(selectedProductForUnit, {
                  name: u.unit_name,
                  price: u.price,
                  ratio: Number(u.ratio),
                })
                setSelectedProductForUnit(null)
                setSearch('')
                inputRef.current?.focus()
              }}
              style={{
                height: 52,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong>
                {u.unit_name} (Quy đổi: {u.ratio})
              </Text>
              <Text type="success" strong>
                {formatCurrency(u.price)}
              </Text>
            </Button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
