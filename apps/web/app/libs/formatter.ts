import React from "react";

export const thaiCurrencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
});

export const formatCurrency = (value: number): string =>
  `${value.toLocaleString()}฿`;

export const formatNumber = (value: number): string =>
  value.toLocaleString();

export const formatZodError = (pathLabel: Record<string, string>, errorRecord: { path: string, errorName: string }[]) => {
  return errorRecord
    .map((error) => `${pathLabel[error.path] || error.path}: ${error.errorName === 'Invalid input' ? 'กรุณาระบุให้ถูกต้อง' : error.errorName}`);
}

export const formatZodErrorToReactNode = (result: ReturnType<typeof formatZodError>) => {
  const parent = React.createElement('div');
  const ul = React.createElement('ul');
  const children = result.map((line, index) => {
    const [key, value] = line.split(':');
    const span = React.createElement('span', { key: index, className: 'font-bold' }, `${key}: `);
    const li = React.createElement('li', { key: index }, [span, value]);
    return li;
  });
  return React.cloneElement(parent, {}, React.cloneElement(ul, {}, children));
}