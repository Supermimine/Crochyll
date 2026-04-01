import type { Row } from '@/model/maker/row';

export interface Pattern {
    rows: Row[];
    yarnSize: string;
    projectSize: string;
}