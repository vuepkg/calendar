import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DataTable from './DataTable.vue'

interface Row {
  id: number
  title: string
}

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'extra', label: 'Extra', hideBelow: 'md' as const },
]

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: index + 1, title: `Row ${index + 1}` }))
}

function mountTable(props: Record<string, unknown> = {}) {
  return mount(DataTable<Row>, {
    props: {
      columns,
      rows: makeRows(3),
      rowKey: (row: Row) => row.id,
      ...props,
    },
    slots: {
      'cell-title': (slotProps: { row: Row }) => slotProps.row.title,
      'cell-extra': () => 'extra',
    },
  })
}

describe('DataTable', () => {
  it('renders one header cell per column with the given labels', () => {
    const wrapper = mountTable()
    const headers = wrapper.findAll('th')
    expect(headers.map((h) => h.text())).toEqual(['Title', 'Extra'])
  })

  it('renders one row per data item using cell slots', () => {
    const wrapper = mountTable()
    const rows = wrapper.findAll('.vp-data-table-row')
    expect(rows).toHaveLength(3)
    expect(rows[0]!.text()).toContain('Row 1')
  })

  it('applies the hideBelow class to the matching column cells', () => {
    const wrapper = mountTable()
    const extraHeader = wrapper.findAll('th')[1]
    expect(extraHeader!.classes()).toContain('vp-data-table-col--hide-md')
  })

  it('shows the empty message when rows is empty', () => {
    const wrapper = mountTable({ rows: [] })
    expect(wrapper.find('.vp-data-table-empty').text()).toBe('No data.')
  })

  it('shows a custom empty message', () => {
    const wrapper = mountTable({ rows: [], emptyMessage: '없음' })
    expect(wrapper.find('.vp-data-table-empty').text()).toBe('없음')
  })

  it('emits row-click on click, Enter, and Space', async () => {
    const wrapper = mountTable()
    const firstRow = wrapper.findAll('.vp-data-table-row')[0]!

    await firstRow.trigger('click')
    await firstRow.trigger('keydown.enter')
    await firstRow.trigger('keydown.space')

    expect(wrapper.emitted('row-click')).toHaveLength(3)
    expect(wrapper.emitted('row-click')![0]).toEqual([{ id: 1, title: 'Row 1' }])
  })

  it('does not render pagination when everything fits on one page', () => {
    const wrapper = mountTable({ rows: makeRows(5), pageSize: 10 })
    expect(wrapper.find('.vp-data-table-pagination').exists()).toBe(false)
  })

  it('paginates rows and disables prev/next at the boundaries (uncontrolled)', async () => {
    const wrapper = mountTable({ rows: makeRows(25), pageSize: 10 })

    expect(wrapper.findAll('.vp-data-table-row')).toHaveLength(10)
    expect(wrapper.find('.vp-data-table-page-info').text()).toBe('1 / 3')

    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('disabled')).toBeDefined()

    await buttons[1]!.trigger('click')
    expect(wrapper.find('.vp-data-table-page-info').text()).toBe('2 / 3')

    await buttons[1]!.trigger('click')
    expect(wrapper.find('.vp-data-table-page-info').text()).toBe('3 / 3')
    expect(wrapper.findAll('button')[1]!.attributes('disabled')).toBeDefined()
  })

  it('resets to page 1 worth of rows when used in controlled mode via update:page', async () => {
    const wrapper = mountTable({ rows: makeRows(25), pageSize: 10, page: 1 })

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[2]])
    // controlled: page prop hasn't changed yet, so the displayed page stays at 1
    expect(wrapper.find('.vp-data-table-page-info').text()).toBe('1 / 3')

    await wrapper.setProps({ page: 2 })
    expect(wrapper.find('.vp-data-table-page-info').text()).toBe('2 / 3')
  })

  it('applies the ariaLabel to the table element', () => {
    const wrapper = mountTable({ ariaLabel: '일정 목록' })
    expect(wrapper.find('table').attributes('aria-label')).toBe('일정 목록')
  })
})
