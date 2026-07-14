import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons/Search'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Keep it under 70 characters for best display in search results'),
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep it under 160 characters for best display in search results'),
    }),
    defineField({
      name: 'image',
      title: 'Share Image',
      type: 'image',
    }),
  ],
})
