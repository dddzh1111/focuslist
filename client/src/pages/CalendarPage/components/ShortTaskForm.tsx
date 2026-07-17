import { Modal, Form, Input, Select, InputNumber } from 'antd';
import type { Priority } from '@/types/task';
import { useListStore } from '@/stores/listStore';
import { useEffect } from 'react';

export interface ShortTaskFormValues {
  title: string;
  description?: string;
  priority: Priority;
  estimatedPomos: number;
  listId?: string;
}

interface ShortTaskFormProps {
  open: boolean;
  dueDate: string;
  onCancel: () => void;
  onFinish: (values: ShortTaskFormValues) => void;
}

function ShortTaskForm({ open, dueDate, onCancel, onFinish }: ShortTaskFormProps) {
  const [form] = Form.useForm<ShortTaskFormValues>();
  const { lists } = useListStore();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, dueDate, form]);

  const handleFinish = (values: ShortTaskFormValues) => {
    onFinish(values);
    form.resetFields();
  };

  return (
    <Modal
      title={`新增短期任务 · ${dueDate}`}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ priority: 'MEDIUM', estimatedPomos: 0 }}
      >
        <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
          <Input placeholder="今天要做什么？" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={2} placeholder="可选描述" />
        </Form.Item>
        <Form.Item name="listId" label="归属清单（可选）">
          <Select
            allowClear
            placeholder="选择长期任务清单"
            options={lists.map((l) => ({ value: l.id, label: l.name }))}
          />
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <Select
            options={[
              { value: 'HIGH', label: '高' },
              { value: 'MEDIUM', label: '中' },
              { value: 'LOW', label: '低' },
            ]}
          />
        </Form.Item>
        <Form.Item name="estimatedPomos" label="预估番茄数">
          <InputNumber min={0} max={99} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ShortTaskForm;
