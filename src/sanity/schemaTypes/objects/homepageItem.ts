import { defineField, defineType } from 'sanity'
import { ImagesIcon } from '@sanity/icons/Images'

export const homepageItem = defineType({
  name: 'homepageItem',
  title: 'Homepage Item',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'GIF', value: 'gif' },
          { title: 'Video', value: 'video' },
        ],
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType === 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'video' && !value) return 'Required'
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video' && !value) return 'Required'
          return true
        }),
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      media: 'image',
      title: 'project.title',
    },
    prepare({ mediaType, media, title }) {
      return {
        title: title || 'Untitled item',
        subtitle: mediaType,
        media,
      }
    },
  },
})
