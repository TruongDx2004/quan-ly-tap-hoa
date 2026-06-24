import { useState } from 'react'
import { Table, Button, Space, Typography, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useOrders } from '../../hooks/useOrders'
import { OrderDetailModal } from './OrderDetailModal'
import type { Order } from '../../types'
import { formatCurrency, formatDateTime, shortId } from '../../lib/format'

const { Text } = Typography

export function OrdersTable() {
  const { data: orders = [], isLoading } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <Text code>{shortId(id)}</Text>,
    },
    {
      title: 'Thời gian bán',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => <Text>{formatDateTime(date)}</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string | null) => (
        <Text type="secondary" ellipsis={{ tooltip: note ?? '' }} style={{ maxWidth: 200 }}>
          {note || '—'}
        </Text>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 150,
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: Order) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedOrderId(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t} đơn hàng` }}
        size="middle"
        scroll={{ x: 600 }}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  )
}
