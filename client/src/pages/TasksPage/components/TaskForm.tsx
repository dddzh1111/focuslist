import { Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import type { Priority } from '@/types/task';
import { useListStore } from '@/stores/listStore';
import { useSectionStore } from '@/stores/sectionStore';
import { useTaskStore } from '@/stores/taskStore';
import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

interface TaskFormProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: TaskFormValues) => void;
  initialValues?: Partial<TaskFormValues>;
  isLongTerm?: boolean;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  estimatedPomos: number;
  focusDuration: number;
  listId?: string;
  sectionId?: string;
  tags?: string[];
  totalChapters?: number;
  sourceTaskId?: string;
}

function TaskForm({ open, onCancel, onFinish, initialValues, isLongTerm = true }: TaskFormProps) {
  const [form] = Form.useForm<TaskFormValues>();
  const { lists } = useListStore();
  const { sectionsByListId, fetchSections } = useSectionStore();
  const { tasks } = useTaskStore();

  const watchListId = Form.useWatch('listId', form);
  const sections = watchListId ? sectionsByListId[watchListId] || [] : [];

  // 获取所有长期任务用于"来源任务"选择
  const longTermTasks = useMemo(
    () => tasks.filter((t) => t.isLongTerm),
    [tasks]
  );

  const normalizedInitialValues = useMemo(() => {
    if (!initialValues) return undefined;
    return {
      ...initialValues,
      dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
    } as TaskFormValues & { dueDate?: dayjs.Dayjs };
  }, [initialValues]);

  useEffect(() => {
    if (open && watchListId) {
      if (!sectionsByListId[watchListId]) {
        fetchSections(watchListId);
      }
    }
  }, [open, watchListId, fetchSections, sectionsByListId]);

  useEffect(() => {
    if (open) {
      if (normalizedInitialValues) {
        form.setFieldsValue(normalizedInitialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, normalizedInitialValues, form]);

  const handleFinish = (values: TaskFormValues) => {
    const payload = {
      ...values,
      dueDate: values.dueDate ? dayjs(values.dueDate).format('YYYY-MM-DD') : undefined,
    };
    onFinish(payload);
    form.resetFields();
  };

  const modalTitle = initialValues
    ? (isLongTerm ? '编辑长期任务' : '编辑每日任务')
    : (isLongTerm ? '新建长期任务' : '新建每日任务');

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ priority: 'MEDIUM', estimatedPomos: 0, totalChapters: 0 }}
      >
        <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
          <Input placeholder={isLongTerm ? '例如：考公复习、英语口语提升' : '例如：今天复习第一章'} />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={2} placeholder="可选描述" />
        </Form.Item>
        <Form.Item name="listId" label="归属清单">
          <Select
            allowClear
            placeholder="选择清单（如健身、英语学习）"
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
        <Form.Item name="dueDate" label="截止日期">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        {/* 长期任务：章节总数 */}
        {isLongTerm && (
          <Form.Item
            name="totalChapters"
            label="章节总数"
            rules={[{ type: 'number', min: 1, message: '长期任务至少需要 1 个章节' }]}
          >
            <InputNumber min={1} max={999} style={{ width: '100%' }} placeholder="设置章节数（如40章）" />
          </Form.Item>
        )}

        {/* 每日任务：来源长期任务选择器 */}
        {!isLongTerm && (
          <Form.Item name="sourceTaskId" label="来源长期任务">
            <Select
              allowClear
              placeholder="选择来源长期任务（可选）"
              options={longTermTasks.map((t) => ({ value: t.id, label: t.title }))}
            />
          </Form.Item>
        )}

        <Form.Item name="estimatedPomos" label="预估番茄数">
          <InputNumber min={0} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="focusDuration" label="单次番茄时长(分钟)">
          <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="0=使用默认25分钟" />
        </Form.Item>
        <Form.Item name="sectionId" label="归属单元">
          <Select
            allowClear
            placeholder="选择单元（可选）"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            disabled={!watchListId}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default TaskForm;


