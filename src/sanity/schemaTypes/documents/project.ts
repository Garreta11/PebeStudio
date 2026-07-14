import { defineField, defineType, defineArrayMember } from 'sanity'
import { CaseIcon } from '@sanity/icons/Case'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categorías',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'client',
      title: 'Cliente',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'year',
      title: 'Año',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.min(1900).max(2100),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'galleryItem' })],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Year, New to Old',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'client',
      media: 'gallery.0.image',
    },
  },
})
