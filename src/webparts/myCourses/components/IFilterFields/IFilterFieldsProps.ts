export interface IFilterFieldsProps{
    onChangeFilterField: any;
    filterField: {
        firstName: string,
        lastName: string,
        jobTitle: string;
        location: any;
        pNumber: any;
    };
    resetSrch: any;
}