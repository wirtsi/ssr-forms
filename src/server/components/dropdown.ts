import { TemplateElement, html } from '@nanoweb/template';

interface DropdownProps {
  title: TemplateElement;
  multiSelect?: boolean;
}

const Dropdown = (props: DropdownProps, ...children: TemplateElement[]) => html`
  <braveheart-dropdown ${props.multiSelect && 'multi-select'}>
    <div slot="title"><span class="label">${props.title}</span><span class="chevron">▾</span></div>
    <slot slot="options">${children}</slot>
  </braveheart-dropdown>
`;

export default Dropdown;
