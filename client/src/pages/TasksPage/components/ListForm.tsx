import { Modal, Form, Input, Space } from 'antd';
import { useState } from 'react';

export interface ListFormValues {
  name: string;
  color?: string;
}

interface ListFormProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: ListFormValues) => void;
}

const PRESET_COLORS = [
  { value: '#3B82F6', label: '蓝' },
  { value: '#8B5CF6', label: '紫' },
  { value: '#EF4444', label: '红' },
  { value: '#F59E0B', label: '黄' },
  { value: '#22C55E', label: '绿' },
  { value: '#06B6D4', label: '青' },
  { value: '#EC4899', label: '粉' },
  { value: '#6366F1', label: '靛' },
];

function ListForm({ open, onCancel, onFinish }: ListFormProps) {
  const [form] = Form.useForm<ListFormValues>();
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const handleFinish = (values: ListFormValues) => {
    onFinish({ ...values, color: selectedColor });
    form.resetFields();
    setSelectedColor('#3B82F6');
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedColor('#3B82F6');
    onCancel();
  };

  return (
    <Modal
      title="新建清单"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      destroyOnClose
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ name: '' }}
      >
        <Form.Item
          name="name"
          label="清单名称"
          rules={[{ required: true, message: '请输入清单名称' }]}
        >
          <Input placeholder="例如：健身、英语学习" />
        </Form.Item>
        <Form.Item label="颜色标识">
          <Space wrap>
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setSelectedColor(c.value)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: selectedColor === c.value ? '2px solid #1F2937' : '2px solid transparent',
                  background: c.value,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedColor === c.value ? '0 0 0 2px #fff inset' : 'none',
                }}
              />
            ))}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ListForm;
