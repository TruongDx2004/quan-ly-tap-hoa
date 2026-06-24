import { useState } from 'react'
import { Layout, Menu, Typography, Drawer, Button, Grid } from 'antd'
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  DashboardOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'

const { Sider, Content, Header, Footer } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

export function AppLayout() {
  const location = useLocation()
  const screens = useBreakpoint()
  const [drawerVisible, setDrawerVisible] = useState(false)

  // Kiểm tra xem có đang ở chế độ desktop hay không (màn hình trung bình trở lên: >= md/768px)
  const isDesktop = screens.md !== false

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard" onClick={() => setDrawerVisible(false)}>Tổng Quan</Link>,
    },
    {
      key: '/pos',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/pos" onClick={() => setDrawerVisible(false)}>Bán Hàng</Link>,
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: <Link to="/products" onClick={() => setDrawerVisible(false)}>Hàng Hóa</Link>,
    },
    {
      key: '/sales',
      icon: <HistoryOutlined />,
      label: <Link to="/sales" onClick={() => setDrawerVisible(false)}>Lịch Sử</Link>,
    },
  ]

  const activeKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    '/dashboard'

  const headerTitles: Record<string, string> = {
    '/dashboard': '📊 Tổng Quan Cửa Hàng',
    '/pos': '🛒 Bán Hàng',
    '/products': '📦 Quản Lý Hàng Hóa',
    '/sales': '📋 Lịch Sử Bán Hàng',
  }

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo / Store Name */}
      <div
        style={{
          padding: '18px 16px 14px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Text
          style={{
            color: '#52c41a',
            fontSize: 20,
            fontWeight: 800,
            display: 'block',
            letterSpacing: 0.5,
          }}
        >
          🏪 O Duyệt
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
          Quản Lý Tạp Hóa
        </Text>
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
        items={menuItems}
        style={{ marginTop: 8, flex: 1 }}
      />

      {/* Footer Credit in Sidebar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, lineHeight: '1.5' }}>
          Phát triển bởi<br />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Xuân Trường</span>
        </Text>
      </div>
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider cho Desktop */}
      {isDesktop ? (
        <Sider
          width={210}
          style={{
            background: '#001529',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            zIndex: 100,
          }}
        >
          {sidebarContent}
        </Sider>
      ) : (
        /* Drawer cho Mobile */
        <Drawer
          title={null}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0, background: '#001529' } }}
          width={210}
          closable={false}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: isDesktop ? 210 : 0, transition: 'margin-left 0.2s ease' }}>
        {/* Top Header */}
        <Header
          style={{
            background: '#fff',
            padding: isDesktop ? '0 24px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            height: 52,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isDesktop && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setDrawerVisible(true)}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#001529' }}>
              {headerTitles[activeKey] ?? '🏪 O Duyệt'}
            </Text>
          </div>
        </Header>

        {/* Page Content */}
        <Content
          style={{
            padding: isDesktop ? 20 : 12,
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 52px - 40px)',
          }}
        >
          <Outlet />
        </Content>

        {/* Bottom Footer */}
        <Footer
          style={{
            textAlign: 'center',
            background: '#f5f5f5',
            padding: '10px 16px',
            borderTop: '1px solid #e8e8e8',
            height: 40,
          }}
        >
          <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
            Được phát triển bởi{' '}
            <Text strong style={{ color: '#1677ff', fontSize: 11 }}>
              Xuân Trường
            </Text>{' '}
            — 2026 · 🏪 Cửa Hàng O Duyệt
          </Text>
        </Footer>
      </Layout>
    </Layout>
  )
}
