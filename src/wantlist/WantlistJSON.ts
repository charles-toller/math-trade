export interface WantlistJSON {
    options: {[option: string]: string | boolean | number};
    officialNames: {[identifier: string]: string};
    userWants: {[username: string]: WantlistItem[]};
}
export type WantlistItem = SingleWantlistItem | MultiWantlistItem;
export interface SingleWantlistItem {
    type: "singleWantlistItem";
    wants: string;
    gives: string[];
}
export interface MultiWantlistItem {
    type: "multiWantlistItem";
    alias: string;
    wants: string[];
    gives: string[];
    quantity: number;
}