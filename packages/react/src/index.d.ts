import type * as React from 'react';

export type Brand = 'k-aquas' | 'd-road' | 'd-find';
export type Scheme = 'light' | 'dark';
export type Density = 'default' | 'compact';
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function ThemeScope(props: React.HTMLAttributes<HTMLElement> & {
  brand?: Brand; scheme?: Scheme; density?: Density; as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}): React.ReactElement;

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ghost-danger';
  size?: 'xs' | 'sm' | 'md' | 'lg'; loading?: boolean;
};
export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const IconButton: React.ForwardRefExoticComponent<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
    label: string;
  } & React.RefAttributes<HTMLButtonElement>>;

type FieldExtras = {
  label: React.ReactNode; helperText?: React.ReactNode; error?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg'; controlClassName?: string;
};
export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & FieldExtras;
export type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras;
export type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & FieldExtras;
export const TextField: React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLInputElement>>;
export const TextareaField: React.ForwardRefExoticComponent<TextareaFieldProps & React.RefAttributes<HTMLTextAreaElement>>;
export const SelectField: React.ForwardRefExoticComponent<SelectFieldProps & React.RefAttributes<HTMLSelectElement>>;

type ChoiceExtras = { label: React.ReactNode; error?: boolean; indeterminate?: boolean };
export const CheckboxField: React.ForwardRefExoticComponent<
  React.InputHTMLAttributes<HTMLInputElement> & ChoiceExtras & React.RefAttributes<HTMLInputElement>>;
export const RadioField: React.ForwardRefExoticComponent<
  React.InputHTMLAttributes<HTMLInputElement> & Omit<ChoiceExtras, 'indeterminate'> & React.RefAttributes<HTMLInputElement>>;
export const SwitchField: React.ForwardRefExoticComponent<
  React.InputHTMLAttributes<HTMLInputElement> & Omit<ChoiceExtras, 'indeterminate'> & React.RefAttributes<HTMLInputElement>>;

export function Badge(props: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }): React.ReactElement;
export const Chip: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; count?: React.ReactNode } &
  React.RefAttributes<HTMLButtonElement>>;
export function Banner(props: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: Exclude<Tone, 'neutral'>; title: React.ReactNode; action?: React.ReactNode;
}): React.ReactElement;
export function Toast(props: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: Exclude<Tone, 'neutral'>; title: React.ReactNode; onDismiss?: () => void; duration?: number;
}): React.ReactElement;
export function Dialog(props: Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'onClose'> & {
  open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode;
  actions?: React.ReactNode; longForm?: boolean;
}): React.ReactElement;

export function TableContainer(props: React.HTMLAttributes<HTMLDivElement> & {
  label: string;
}): React.ReactElement;
export function DataTable(props: React.TableHTMLAttributes<HTMLTableElement>): React.ReactElement;
export function SortHeader(props: React.ThHTMLAttributes<HTMLTableCellElement> & {
  direction?: 'none' | 'ascending' | 'descending'; onSort: () => void;
}): React.ReactElement;
export function Pagination(props: { page: number; pageCount: number; onPageChange: (page: number) => void;
  label?: string; className?: string }): React.ReactElement;
export function Tabs(props: { items: Array<{ id: string; label: React.ReactNode; content: React.ReactNode;
  disabled?: boolean }>; selected: string; onChange: (id: string) => void; label?: string;
  className?: string }): React.ReactElement;
export function Tooltip(props: { trigger: React.ReactElement; children: React.ReactNode;
  className?: string }): React.ReactElement;
export function Breadcrumb(props: { items: Array<{ label: React.ReactNode; href?: string }>;
  label?: string; className?: string }): React.ReactElement;
export function Disclosure(props: Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, 'title'> & {
  title: React.ReactNode; children: React.ReactNode;
}): React.ReactElement;
export function Dropdown(props: React.DetailsHTMLAttributes<HTMLDetailsElement> & {
  label: React.ReactNode; children: React.ReactNode;
}): React.ReactElement;

export function FormSection(props: { title: React.ReactNode; description?: React.ReactNode;
  children?: React.ReactNode; className?: string }): React.ReactElement;
export function FormGrid(props: { pair?: boolean; children?: React.ReactNode; className?: string }): React.ReactElement;
export function FormActions(props: { status?: { state: 'pristine' | 'saving' | 'success' | 'error';
  message: string }; children?: React.ReactNode; className?: string }): React.ReactElement;
export function Progress(props: { label: string; value?: number; max?: number;
  className?: string }): React.ReactElement;
export function Spinner(props: { label?: string; className?: string }): React.ReactElement;
