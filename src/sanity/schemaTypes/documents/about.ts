import { defineField, defineType, defineArrayMember } from 'sanity'
import { UserIcon } from '@sanity/icons/User'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'mainDescription',
      title: 'Descripción principal',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'exhibitions',
      title: 'Exhibitions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'exhibition',
          fields: [
            defineField({
              name: 'year',
              title: 'Year',
              type: 'number',
              validation: (rule) => rule.required().min(1900).max(2100),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'year' },
          },
        }),
      ],
    }),
    defineField({
      name: 'press',
      title: 'Press',
      type: 'array',
      of: [defineArrayMember({ type: 'linkItem' })],
    }),
    defineField({
      name: 'interviews',
      title: 'Interviews',
      type: 'array',
      of: [defineArrayMember({ type: 'linkItem' })],
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'social',
      title: 'Social',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About' }
    },
  },
})
