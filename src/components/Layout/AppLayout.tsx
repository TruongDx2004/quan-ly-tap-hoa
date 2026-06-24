import { Layout, Menu, Typography } from 'antd'
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'

const { Sider, Content, Header, Footer } = Layout
const { Text } = Typography

export function AppLayout() {
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Tổng Quan</Link>,
    },
    {
      key: '/pos',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/pos">Bán Hàng</Link>,
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: <Link to="/products">Hàng Hóa</Link>,
    },
    {
      key: '/sales',
      icon: <HistoryOutlined />,
      label: <Link to="/sales">Lịch Sử</Link>,
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={210}
        style={{
          background: '#001529',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
      </Sider>

      <Layout style={{ marginLeft: 210 }}>
        {/* Top Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            height: 52,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#001529' }}>
            {headerTitles[activeKey] ?? '🏪 O Duyệt'}
          </Text>
        </Header>

        {/* Page Content */}
        <Content
          style={{
            padding: 20,
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
            padding: '10px 24px',
            borderTop: '1px solid #e8e8e8',
            height: 40,
          }}
        >
          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
            Được phát triển bởi{' '}
            <Text strong style={{ color: '#1677ff', fontSize: 12 }}>
              Xuân Trường
            </Text>{' '}
            — 2026 · 🏪 Cửa Hàng O Duyệt
          </Text>
        </Footer>
      </Layout>
    </Layout>
  )
}
