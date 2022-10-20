export enum AmenityItemSortCriteria {
    DATE_CREATED_ASCENDING = 'dateCreatedAsc',
    DATE_CREATED_DESCENDING = 'dateCreatedDesc',
    TITLE_ASCENDING = 'titleAsc',
    TITLE_DESCENDING = 'titleDesc',
  }
  
  export const AmenityItemSortMap = new Map<AmenityItemSortCriteria, any>([
    [AmenityItemSortCriteria.DATE_CREATED_ASCENDING, { createdAt: 1 }],
    [AmenityItemSortCriteria.DATE_CREATED_DESCENDING, { createdAt: -1 }],
    [AmenityItemSortCriteria.TITLE_ASCENDING, { title: 1 }],
    [AmenityItemSortCriteria.TITLE_DESCENDING, { title: -1 }],
  ]);
  