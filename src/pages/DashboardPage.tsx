import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Spin,
  Alert,
  Progress,
  Badge,
  Divider,
} from 'antd'
import {
  ShoppingOutlined,
  DollarOutlined,
  WarningOutlined,
  RiseOutlined,
  InboxOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useDashboard } from '../hooks/useDashboard'
import { formatCurrency, formatDateTime, shortId } from '../lib/format'
import type { RecentOrder, TopProduct, CategoryStat } from '../hooks/useDashboard'

const { Title, Text } = Typography

// Màu sắc thống nhất
const COLORS = {
  revenue: '#52c41a',
  orders: '#1677ff',
  stock: '#722ed1',
  warning: '#fa8c16',
  danger: '#ff4d4f',
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" description="Đang tải thống kê..." />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Alert
        type="error"
        title="Không thể tải dữ liệu thống kê"
        description="Kiểm tra kết nối Supabase và thử lại."
        showIcon
      />
    )
  }

  // Tỷ lệ hàng sắp hết / tổng hàng
  const lowStockRate = stats.totalProducts > 0
    ? Math.round(((stats.lowStockCount + stats.outOfStockCount) / stats.totalProducts) * 100)
    : 0

  // Columns cho bảng đơn gần đây
  const recentColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <Text code>{shortId(id)}</Text>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(d)}</Text>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: COLORS.revenue }}>{formatCurrency(v)}</Text>
      ),
    },
  ]

  // Columns cho bảng top sản phẩm
  const topColumns = [
    {
      title: '#',
      key: 'rank',
      width: 40,
      render: (_: unknown, __: TopProduct, idx: number) => (
        <Text strong style={{ color: idx === 0 ? '#faad14' : idx === 1 ? '#8c8c8c' : '#d4380d' }}>
          {idx + 1}
        </Text>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'total_sold',
      key: 'total_sold',
      align: 'center' as const,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: COLORS.revenue }}>{formatCurrency(v)}</Text>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hàng 1: Doanh thu hôm nay + tháng này */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 10, borderLeft: `4px solid ${COLORS.revenue}` }}>
            <Statistic
              title={<Text strong>💰 Doanh thu hôm nay</Text>}
              value={stats.todayRevenue}
              formatter={(v) => formatCurrency(Number(v))}
              valueStyle={{ color: COLORS.revenue, fontSize: 22 }}
              prefix={<RiseOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.todayOrders} đơn hàng
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 10, borderLeft: `4px solid ${COLORS.orders}` }}>
            <Statistic
              title={<Text strong>📅 Doanh thu tháng này</Text>}
              value={stats.monthRevenue}
              formatter={(v) => formatCurrency(Number(v))}
              valueStyle={{ color: COLORS.orders, fontSize: 22 }}
              prefix={<DollarOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.monthOrders} đơn hàng
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 10, borderLeft: `4px solid ${COLORS.stock}` }}>
            <Statistic
              title={<Text strong>📦 Tổng sản phẩm</Text>}
              value={stats.totalProducts}
              suffix="loại"
              valueStyle={{ color: COLORS.stock, fontSize: 22 }}
              prefix={<ShoppingOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng tồn kho: {stats.totalStock.toLocaleString('vi-VN')} cái
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 10, borderLeft: `4px solid ${COLORS.danger}` }}>
            <Statistic
              title={<Text strong>⚠️ Hàng sắp / hết</Text>}
              value={stats.lowStockCount + stats.outOfStockCount}
              suffix="sản phẩm"
              valueStyle={{
                color: stats.outOfStockCount > 0 ? COLORS.danger : COLORS.warning,
                fontSize: 22,
              }}
              prefix={<WarningOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hết hàng: <Text strong style={{ color: COLORS.danger }}>{stats.outOfStockCount}</Text>
              {' | '}Sắp hết: <Text strong style={{ color: COLORS.warning }}>{stats.lowStockCount}</Text>
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Hàng 2: Giá trị kho + cảnh báo */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            style={{ borderRadius: 10 }}
            title={
              <span>
                <InboxOutlined style={{ color: COLORS.stock, marginRight: 8 }} />
                Giá trị tồn kho
              </span>
            }
          >
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Title level={2} style={{ color: COLORS.stock, margin: '0 0 4px 0' }}>
                {formatCurrency(stats.totalInventoryValue)}
              </Title>
              <Text type="secondary">Tổng giá trị hàng hóa hiện có trong kho (theo giá bán)</Text>
            </div>
            <Divider style={{ margin: '16px 0 12px' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text>Tỷ lệ hàng cần nhập thêm</Text>
                <Text strong style={{ color: lowStockRate > 20 ? COLORS.danger : COLORS.revenue }}>
                  {lowStockRate}%
                </Text>
              </div>
              <Progress
                percent={lowStockRate}
                status={lowStockRate > 30 ? 'exception' : lowStockRate > 15 ? 'normal' : 'success'}
                showInfo={false}
                strokeColor={lowStockRate > 30 ? COLORS.danger : lowStockRate > 15 ? COLORS.warning : COLORS.revenue}
              />
              {lowStockRate > 20 && (
                <Alert
                  style={{ marginTop: 10 }}
                  type="warning"
                  showIcon
                  title={`Có ${stats.lowStockCount + stats.outOfStockCount} sản phẩm cần nhập hàng gấp!`}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            style={{ borderRadius: 10 }}
            title={
              <span>
                <ClockCircleOutlined style={{ color: COLORS.orders, marginRight: 8 }} />
                Đơn hàng gần đây
              </span>
            }
          >
            {stats.recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa' }}>
                Chưa có đơn hàng nào
              </div>
            ) : (
              <Table<RecentOrder>
                columns={recentColumns}
                dataSource={stats.recentOrders}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Hàng 3: Top sản phẩm bán chạy tháng này */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            variant="borderless"
            style={{ borderRadius: 10 }}
            title={
              <span>
                <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                Top sản phẩm bán chạy tháng này
                <Badge
                  count="Tháng này"
                  style={{ background: COLORS.orders, marginLeft: 10, fontSize: 11 }}
                />
              </span>
            }
          >
            {stats.topProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa' }}>
                Chưa có dữ liệu bán hàng trong tháng này
              </div>
            ) : (
              <Table<TopProduct>
                columns={topColumns}
                dataSource={stats.topProducts}
                rowKey="product_name"
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Hàng 4: Thống kê kho theo danh mục */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            variant="borderless"
            style={{ borderRadius: 10 }}
            title={
              <span>
                <ShoppingOutlined style={{ color: COLORS.stock, marginRight: 8 }} />
                Thống kê tồn kho theo danh mục
              </span>
            }
          >
            <Table<CategoryStat>
              columns={[
                {
                  title: 'Danh mục',
                  dataIndex: 'category',
                  key: 'category',
                  render: (cat: string) => <Tag color="blue">{cat}</Tag>,
                },
                {
                  title: 'Số loại SP',
                  dataIndex: 'productCount',
                  key: 'productCount',
                  width: 110,
                  align: 'center' as const,
                  render: (v: number) => <Tag color="purple">{v} loại</Tag>,
                },
                {
                  title: 'Tổng tồn kho',
                  dataIndex: 'totalStock',
                  key: 'totalStock',
                  width: 130,
                  align: 'right' as const,
                  render: (v: number) => (
                    <Text>{v % 1 === 0 ? v : v.toFixed(2)}</Text>
                  ),
                },
                {
                  title: 'Giá trị kho',
                  dataIndex: 'inventoryValue',
                  key: 'inventoryValue',
                  width: 160,
                  align: 'right' as const,
                  render: (v: number) => (
                    <Text strong style={{ color: COLORS.stock }}>
                      {formatCurrency(v)}
                    </Text>
                  ),
                },
              ]}
              dataSource={stats.categoryStats}
              rowKey="category"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
