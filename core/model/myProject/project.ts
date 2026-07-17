import { StateProject } from "../../enum/stateProject";
import { TypeMaking } from "../../enum/typeMaking";
import { Yarn } from "./yarn";

export interface Project {
    name: string;
    description: string;
    type: TypeMaking;
    hookSize: number;
    image?: string;
    state: StateProject;
    notes: string[];
    yarns: Yarn[];
    noPlace?: string;
}