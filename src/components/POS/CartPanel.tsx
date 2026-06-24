import { useState } from 'react'
import {
  Button,
  Typography,
  InputNumber,
  Space,
  Divider,
  Empty,
  List,
  Image,
  Tooltip,
} from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useCartStore, selectCartTotal } from '../../stores/cartStore'
import { CheckoutModal } from './CheckoutModal'
import { formatCurrency } from '../../lib/format'

const { Text, Title } = Typography

export function CartPanel() {
  const { items, updateQuantity, removeFromCart } = useCartStore()
  const total = useCartStore(selectCartTotal)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ShoppingCartOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        <Text style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
          Giỏ hàng ({items.length} sp)
        </Text>
      </div>

      {/* Cart Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {items.length === 0 ? (
          <Empty
            description="Chưa có sản phẩm"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 40 }}
          />
        ) : (
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '8px 16px' }}
                actions={[
                  <Tooltip title="Xóa" key="del">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.product.id, item.selected_unit.name)}
                    />
                  </Tooltip>,
                ]}
              >
                <Space style={{ width: '100%' }} size={10}>
                  {/* Thumbnail */}
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      preview={false}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: '#f5f5f5',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      📦
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text ellipsis strong style={{ display: 'block', fontSize: 13 }}>
                      {item.product.name}
                      <span style={{ color: '#fa8c16', marginLeft: 4 }}>
                        ({item.selected_unit.name})
                      </span>
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatCurrency(item.selected_unit.price)} / {item.selected_unit.name}
                    </Text>
                  </div>

                  {/* Quantity (Hỗ trợ nhập số lẻ, giới hạn theo số lượng tồn quy đổi) */}
                  <InputNumber
                    size="small"
                    min={0.01}
                    step={0.1}
                    max={
                      item.selected_unit.ratio === 1
                        ? item.product.quantity
                        : Math.floor(item.product.quantity / item.selected_unit.ratio)
                    }
                    value={item.quantity}
                    onChange={(v) => updateQuantity(item.product.id, item.selected_unit.name, v ?? 1)}
                    style={{ width: 80 }}
                  />

                  {/* Subtotal */}
                  <Text
                    strong
                    style={{ color: '#1677ff', fontSize: 13, minWidth: 80, textAlign: 'right' }}
                  >
                    {formatCurrency(item.selected_unit.price * item.quantity)}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer: Total + Checkout */}
      <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 16 }}>Tổng tiền:</Text>
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
            {formatCurrency(total)}
          </Title>
        </div>
        <Button
          type="primary"
          size="large"
          block
          disabled={items.length === 0}
          onClick={() => setCheckoutOpen(true)}
          style={{
            height: 48,
            fontSize: 16,
            fontWeight: 600,
            background: items.length === 0 ? undefined : '#52c41a',
            borderColor: items.length === 0 ? undefined : '#52c41a',
          }}
        >
          💳 Thanh Toán
        </Button>
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}
