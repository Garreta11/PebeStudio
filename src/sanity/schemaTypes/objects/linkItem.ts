import { defineField, defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons/Link'

export const linkItem = defineType({
  name: 'linkItem',
  title: 'Link Item',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'url' },
  },
})
