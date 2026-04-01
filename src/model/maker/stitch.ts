import type { StitchType } from '@/enum/stitchType';
import type { StitchOrientation } from '@/enum/stitchOrientation';
import type { StitchAction } from '@/enum/stitchAction';

export interface Stitch {
    type: StitchType;
    orientation: StitchOrientation;
    action: StitchAction;
    nbTime: number;
    count: number;
}