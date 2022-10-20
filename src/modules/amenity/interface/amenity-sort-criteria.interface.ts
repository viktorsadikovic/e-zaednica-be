export enum AmenitySortCriteria {
  DATE_CREATED_ASCENDING = 'dateCreatedAsc',
  DATE_CREATED_DESCENDING = 'dateCreatedDesc',
  TITLE_ASCENDING = 'titleAsc',
  TITLE_DESCENDING = 'titleDesc',
}

export const AmenitySortMap = new Map<AmenitySortCriteria, any>([
  [AmenitySortCriteria.DATE_CREATED_ASCENDING, { createdAt: 1 }],
  [AmenitySortCriteria.DATE_CREATED_DESCENDING, { createdAt: -1 }],
  [AmenitySortCriteria.TITLE_ASCENDING, { title: 1 }],
  [AmenitySortCriteria.TITLE_DESCENDING, { title: -1 }],
]);
