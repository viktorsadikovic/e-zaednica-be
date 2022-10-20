export enum AnnouncementSortCriteria {
  DATE_CREATED_ASCENDING = 'dateCreatedAsc',
  DATE_CREATED_DESCENDING = 'dateCreatedDesc',
  TITLE_ASCENDING = 'titleAsc',
  TITLE_DESCENDING = 'titleDesc',
}

export const AnnouncementSortMap = new Map<AnnouncementSortCriteria, any>([
  [AnnouncementSortCriteria.DATE_CREATED_ASCENDING, { createdAt: 1 }],
  [AnnouncementSortCriteria.DATE_CREATED_DESCENDING, { createdAt: -1 }],
  [AnnouncementSortCriteria.TITLE_ASCENDING, { title: 1 }],
  [AnnouncementSortCriteria.TITLE_DESCENDING, { title: -1 }],
]);
