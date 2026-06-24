import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  Image,
  Space,
  Divider,
  Select,
  Row,
  Col,
  Typography,
  message,
} from 'antd'
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useCreateProduct, useUpdateProduct, uploadProductImage } from '../../hooks/useProducts'
import type { Product, ProductFormValues, ProductUnitConversion } from '../../types'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../../lib/constants'

const { Text } = Typography

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  price: z.number({ invalid_type_error: 'Nhập giá bán' }).min(0, 'Giá không hợp lệ'),
  cost_price: z.number().min(0).nullable().optional(),
  quantity: z.number({ invalid_type_error: 'Nhập số lượng' }).min(0, 'Số lượng không hợp lệ'), // Hỗ trợ số thập phân (bỏ .int())
  category: z.string().min(1, 'Chọn danh mục'),
  unit: z.string().min(1, 'Chọn hoặc nhập đơn vị tính'),
  barcode: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
})

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  product?: Product | null // null = add new
}

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const isEdit = !!product
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [subUnits, setSubUnits] = useState<ProductUnitConversion[]>([])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      cost_price: null,
      quantity: 0,
      category: 'Khác',
      unit: 'cái',
      barcode: null,
      image_url: null,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          price: product.price,
          cost_price: product.cost_price,
          quantity: product.quantity,
          category: product.category || 'Khác',
          unit: product.unit || 'cái',
          barcode: product.barcode,
          image_url: product.image_url,
        })
        setSubUnits(product.product_units || [])
      } else {
        reset({
          name: '',
          price: 0,
          cost_price: null,
          quantity: 0,
          category: 'Khác',
          unit: 'cái',
          barcode: null,
          image_url: null,
        })
        setSubUnits([])
      }
    }
  }, [open, product, reset])

  const imageUrl = watch('image_url')

  const handleImageUpload = async (file: UploadFile): Promise<boolean> => {
    try {
      const rawFile = file.originFileObj ?? (file as unknown as File)
      const url = await uploadProductImage(rawFile)
      setValue('image_url', url)
      message.success('Upload ảnh thành công!')
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err)
      message.error(`Upload ảnh thất bại: ${err?.message || 'Kiểm tra Supabase Storage.'}`)
    }
    return false // prevent default upload
  }

  const handleAddSubUnit = () => {
    setSubUnits([
      ...subUnits,
      { unit_name: '', ratio: 1, price: 0, barcode: null },
    ])
  }

  const handleRemoveSubUnit = (index: number) => {
    setSubUnits(subUnits.filter((_, idx) => idx !== index))
  }

  const handleSubUnitChange = (index: number, key: keyof ProductUnitConversion, value: any) => {
    const updated = [...subUnits]
    updated[index] = { ...updated[index], [key]: value }
    setSubUnits(updated)
  }

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      cost_price: values.cost_price ?? null,
      quantity: values.quantity,
      category: values.category,
      unit: values.unit,
      barcode: values.barcode?.trim() || null,
      image_url: values.image_url ?? null,
      product_units: subUnits.filter(
        (u) => u.unit_name.trim() !== '' && u.ratio > 0 && u.price >= 0
      ),
    }

    if (isEdit && product) {
      await updateProduct.mutateAsync({ id: product.id, data: payload })
    } else {
      await createProduct.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <Modal
      title={isEdit ? '✏️ Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Name */}
        <Form.Item
          label="Tên sản phẩm *"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="VD: Nước ngọt Coca Cola 330ml" size="large" />
            )}
          />
        </Form.Item>

        {/* Price & Cost Price */}
        <Form.Item label="Giá bán *" validateStatus={errors.price ? 'error' : ''} help={errors.price?.message}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                step={1000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                suffix="₫"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Giá nhập (tùy chọn)" validateStatus={errors.cost_price ? 'error' : ''} help={errors.cost_price?.message}>
          <Controller
            name="cost_price"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value ?? undefined}
                onChange={(v) => field.onChange(v ?? null)}
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                step={1000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                suffix="₫"
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* Category & Unit */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Danh mục *"
              validateStatus={errors.category ? 'error' : ''}
              help={errors.category?.message}
            >
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Chọn danh mục"
                    size="large"
                    options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Đơn vị tính *"
              validateStatus={errors.unit ? 'error' : ''}
              help={errors.unit?.message}
            >
              <Controller
                name="unit"
                control={control}
                render={({ field }) => {
                  const isPreset = PRODUCT_UNITS.includes(field.value as any)
                  const selectValue = isPreset ? field.value : 'Khác'

                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                      <Select
                        value={selectValue}
                        onChange={(val) => {
                          if (val === 'Khác') {
                            field.onChange('') // Reset to empty so they can type
                          } else {
                            field.onChange(val)
                          }
                        }}
                        placeholder="Chọn đơn vị tính"
                        size="large"
                        options={[
                          ...PRODUCT_UNITS.map((u) => ({ value: u, label: u })),
                          { value: 'Khác', label: '✍️ Nhập đơn vị khác...' },
                        ]}
                      />
                      {!isPreset && (
                        <Input
                          placeholder="Nhập ĐVT khác (mét, kg...)"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          size="large"
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Space>
                  )
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Quantity (Support decimal quantities) */}
        <Form.Item label="Tồn kho *" validateStatus={errors.quantity ? 'error' : ''} help={errors.quantity?.message}>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                step={0.1}
                stringMode={false}
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* Barcode */}
        <Form.Item label="Barcode (tùy chọn)">
          <Controller
            name="barcode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder="Quét hoặc nhập barcode"
                size="large"
              />
            )}
          />
        </Form.Item>

        {/* Đơn vị quy đổi phụ */}
        <Divider style={{ margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text strong style={{ fontSize: 14 }}>
              📦 Đơn vị quy đổi phụ (Ví dụ: lốc, thùng...)
            </Text>
            <Button
              type="dashed"
              onClick={handleAddSubUnit}
              icon={<PlusOutlined />}
              size="small"
            >
              Thêm đơn vị
            </Button>
          </div>

          {subUnits.length === 0 ? (
            <Text type="secondary" style={{ fontSize: 13, display: 'block', textAlign: 'center', padding: '8px 0' }}>
              Chưa cấu hình đơn vị quy đổi phụ (chỉ bán theo đơn vị cơ bản)
            </Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subUnits.map((u, idx) => (
                <Row gutter={8} key={idx} align="middle">
                  {/* Tên đơn vị */}
                  <Col span={5}>
                    <Select
                      value={u.unit_name || undefined}
                      onChange={(val) => handleSubUnitChange(idx, 'unit_name', val)}
                      placeholder="ĐVT"
                      options={PRODUCT_UNITS.map((unit) => ({ value: unit, label: unit }))}
                      dropdownMatchSelectWidth={false}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  {/* Hệ số */}
                  <Col span={5}>
                    <InputNumber
                      value={u.ratio}
                      onChange={(val) => handleSubUnitChange(idx, 'ratio', val ?? 1)}
                      placeholder="Hệ số"
                      min={0.01}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  {/* Giá bán */}
                  <Col span={6}>
                    <InputNumber
                      value={u.price}
                      onChange={(val) => handleSubUnitChange(idx, 'price', val ?? 0)}
                      placeholder="Giá bán"
                      min={0}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  {/* Barcode phụ */}
                  <Col span={6}>
                    <Input
                      value={u.barcode || ''}
                      onChange={(e) => handleSubUnitChange(idx, 'barcode', e.target.value || null)}
                      placeholder="Barcode"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  {/* Xóa */}
                  <Col span={2} style={{ textAlign: 'right' }}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveSubUnit(idx)}
                    />
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <Divider style={{ margin: '12px 0' }} />
        <Form.Item label="Ảnh sản phẩm (tùy chọn)">
          <Space direction="vertical" style={{ width: '100%' }}>
            {imageUrl ? (
              <Space>
                <Image src={imageUrl} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setValue('image_url', null)}
                  size="small"
                >
                  Xóa ảnh
                </Button>
              </Space>
            ) : (
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImageUpload(file as unknown as UploadFile)
                  return false
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            )}
          </Space>
        </Form.Item>

        {/* Actions */}
        <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting || createProduct.isPending || updateProduct.isPending}
            >
              {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
