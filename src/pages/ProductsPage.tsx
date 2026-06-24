import { Card } from 'antd'
import { ProductTable } from '../components/Products/ProductTable'

export default function ProductsPage() {
  return (
    <Card variant="borderless" style={{ borderRadius: 10, minHeight: '100%' }}>
      <ProductTable />
    </Card>
  )
}
