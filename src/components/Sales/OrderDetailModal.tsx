import { Modal, Table, Typography, Space, Divider, Spin } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { useOrderItems } from '../../hooks/useOrders'
import type { OrderItem } from '../../types'
import { formatCurrency, shortId } from '../../lib/format'

const { Text } = Typography

interface OrderDetailModalProps {
  orderId: string | null
  onClose: () => void
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: items = [], isLoading } = useOrderItems(orderId)

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number, record: OrderItem) => (
        <Text>
          {qty % 1 === 0 ? qty : qty.toFixed(2)} {record.product_unit || 'cái'}
        </Text>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price_at_time',
      key: 'price_at_time',
      width: 140,
      render: (v: number) => <Text>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      width: 150,
      render: (_: unknown, record: OrderItem) => (
        <Text strong style={{ color: '#1677ff' }}>
          {formatCurrency(record.price_at_time * record.quantity)}
        </Text>
      ),
    },
  ]

  const totalOrderAmount = items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  )

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1677ff' }} />
          Chi tiết đơn hàng {orderId ? `#${shortId(orderId)}` : ''}
        </Space>
      }
      open={!!orderId}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />

          <Divider style={{ margin: '16px 0 12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 15 }}>Tổng cộng:</Text>
            <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
              {formatCurrency(totalOrderAmount)}
            </Text>
          </div>
        </>
      )}
    </Modal>
  )
}
