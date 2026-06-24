import { Modal, Table, Typography, Space, Tag, Divider, Input } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useCartStore, selectCartTotal } from '../../stores/cartStore'
import { useCreateOrder } from '../../hooks/useOrders'
import { formatCurrency } from '../../lib/format'
import { useState } from 'react'

const { Text, Title } = Typography
const { TextArea } = Input

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, clearCart } = useCartStore()
  const total = useCartStore(selectCartTotal)
  const createOrder = useCreateOrder()
  const [note, setNote] = useState('')

  const handleConfirm = async () => {
    await createOrder.mutateAsync({ items, note: note.trim() || undefined })
    clearCart()
    setNote('')
    onClose()
  }

  interface CheckoutTableItem {
    key: string
    name: string
    unit: string
    qty: number
    price: number
    sub: number
  }

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: CheckoutTableItem) => (
        <Text>{record.name}</Text>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'qty',
      key: 'qty',
      width: 90,
      align: 'center' as const,
      render: (qty: number, record: CheckoutTableItem) => (
        <Text>{qty % 1 === 0 ? qty : qty.toFixed(2)} {record.unit}</Text>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      render: (v: number) => <Text>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'sub',
      key: 'sub',
      width: 120,
      render: (v: number) => (
        <Text strong style={{ color: '#1677ff' }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
  ]

  const tableData = items.map((item) => ({
    key: `${item.product.id}-${item.selected_unit.name}`,
    name: item.product.name,
    unit: item.selected_unit.name,
    qty: item.quantity,
    price: item.selected_unit.price,
    sub: item.selected_unit.price * item.quantity,
  }))

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          Xác nhận thanh toán
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="✅ Xác nhận thanh toán"
      cancelText="Quay lại"
      confirmLoading={createOrder.isPending}
      width={560}
      okButtonProps={{
        style: { background: '#52c41a', borderColor: '#52c41a', height: 40, fontSize: 15 },
      }}
    >
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        scroll={{ y: 240 }}
        style={{ marginBottom: 12 }}
      />

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 16 }}>Tổng cộng:</Text>
        <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
          {formatCurrency(total)}
        </Title>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Tag color="blue" style={{ fontSize: 13 }}>
          💰 Số sản phẩm: {items.length} loại
        </Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Sau khi xác nhận, tồn kho sẽ được trừ tự động.
        </Text>
        <TextArea
          placeholder="Ghi chú đơn hàng (tùy chọn)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          style={{ marginTop: 4 }}
        />
      </Space>
    </Modal>
  )
}
