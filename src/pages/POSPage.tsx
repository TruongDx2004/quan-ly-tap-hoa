import { useState } from 'react'
import { Row, Col, Grid, Segmented, Badge } from 'antd'
import { ProductSearchPanel } from '../components/POS/ProductSearchPanel'
import { CartPanel } from '../components/POS/CartPanel'
import { useCartStore } from '../stores/cartStore'
import { ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons'

export default function POSPage() {
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const cartItemsCount = useCartStore((s) => s.items.length)
  const [activeView, setActiveView] = useState<'products' | 'cart'>('products')

  // Giao diện cho Mobile / Tablet nhỏ
  if (isMobile) {
    return (
      <div style={{ height: 'calc(100vh - 116px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Toggle chuyển đổi mượt mà */}
        <Segmented
          block
          size="large"
          value={activeView}
          onChange={(value) => setActiveView(value as 'products' | 'cart')}
          options={[
            {
              label: (
                <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <AppstoreOutlined style={{ fontSize: 16 }} />
                  <span>Sản phẩm</span>
                </div>
              ),
              value: 'products',
            },
            {
              label: (
                <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Badge count={cartItemsCount} size="small" offset={[4, -2]}>
                    <ShoppingCartOutlined style={{ fontSize: 16 }} />
                  </Badge>
                  <span>Giỏ hàng</span>
                </div>
              ),
              value: 'cart',
            },
          ]}
        />

        {/* Thùng chứa phần hiển thị chiếm toàn bộ diện tích còn lại */}
        <div style={{ flex: 1, height: 0, minHeight: 0 }}>
          {activeView === 'products' ? (
            <ProductSearchPanel />
          ) : (
            <CartPanel />
          )}
        </div>
      </div>
    )
  }

  // Giao diện cho Desktop song song 2 cột
  return (
    <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 132px)', margin: 0 }}>
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
