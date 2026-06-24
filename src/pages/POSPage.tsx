import { Row, Col } from 'antd'
import { ProductSearchPanel } from '../components/POS/ProductSearchPanel'
import { CartPanel } from '../components/POS/CartPanel'

export default function POSPage() {
  return (
    <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 92px)', margin: 0 }}>
      {/* Product Searching Panel (Left) */}
      <Col xs={24} md={14} lg={15} xl={16} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ProductSearchPanel />
      </Col>

      {/* Cart & Checkout Panel (Right) */}
      <Col xs={24} md={10} lg={9} xl={8} style={{ height: '100%' }}>
        <CartPanel />
      </Col>
    </Row>
  )
}
