import { Card } from 'antd'
import { OrdersTable } from '../components/Sales/OrdersTable'

export default function SalesHistoryPage() {
  return (
    <Card variant="borderless" style={{ borderRadius: 10, minHeight: '100%' }}>
      <OrdersTable />
    </Card>
  )
}
