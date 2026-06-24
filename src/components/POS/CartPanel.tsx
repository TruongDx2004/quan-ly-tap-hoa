import { useState } from 'react'
import {
  Button,
  Typography,
  InputNumber,
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
                style={{ padding: '8px 12px' }}
              >
                <div style={{ display: 'flex', width: '100%', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {/* Left Section: Image and Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px', minWidth: 0 }}>
                    {/* Thumbnail */}
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        width={36}
                        height={36}
                        style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                        preview={false}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          background: '#f5f5f5',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        📦
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text ellipsis={{ tooltip: item.product.name }} strong style={{ display: 'block', fontSize: 13, marginBottom: 2 }}>
                        {item.product.name}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#fffbe6',
                          color: '#d46b08',
                          border: '1px solid #ffe58f',
                          fontSize: 11,
                          padding: '0 4px',
                          borderRadius: 4,
                          fontWeight: 500,
                          lineHeight: '16px'
                        }}>
                          {item.selected_unit.name}
                        </span>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatCurrency(item.selected_unit.price)}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Quantity, Total price, and Delete button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flex: '1 0 160px' }}>
                    {/* Quantity */}
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
                      style={{ width: 70 }}
                    />

                    {/* Subtotal */}
                    <div style={{ flex: 1, textAlign: 'right', minWidth: 60 }}>
                      <Text strong style={{ color: '#1677ff', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {formatCurrency(item.selected_unit.price * item.quantity)}
                      </Text>
                    </div>

                    {/* Delete Button */}
                    <Tooltip title="Xóa">
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.product.id, item.selected_unit.name)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    </Tooltip>
                  </div>
                </div>
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
