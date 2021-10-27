import * as React from 'react';
import styles from './MyCourses.module.scss';
import { IMyCoursesProps } from './IMyCoursesProps';

import {PrimaryButton} from 'office-ui-fabric-react';
import {arrayUnique, getMyLocsDpd, readBatchItems, readNextBatchItems} from  '../Services/DataRequests';
import IListItems from '../components/IListItems/IListItems';
import IFilterFields from '../components/IFilterFields/IFilterFields';

export default function MyCourses (props: IMyCoursesProps){
  const [currListItems, setCurrListItems] = React.useState([]);
  const [nextObj, setNextObj] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [historyItems, setHistoryItems] = React.useState([]);
  const [nextDisabled, setNextDisabled] = React.useState(false);

  const [formTitles, setFormTitles] = React.useState([]);
  const [formLocationNos, setFormLocationNos] = React.useState([]);
  const [preloaderVisible, setPreloaderVisible] = React.useState(true);
  const [filterFields, setFilterFields] = React.useState({
    title: {key: "", text: ""},
    formStatus: {key: "", text: ""},
    formDetails: "",
    fullName: "",
    locationNo: {key: "", text: ""},
  });
  const [debouncedFilterFields, setDebouncedFitlerFields] = React.useState(filterFields);

  React.useEffect(()=>{
    getMyLocsDpd(props.context).then(r=>{
      setFormLocationNos(r.sort((a, b) => a.text.localeCompare(b.text)));
    });
    readBatchItems(props.context, props.listUrl, props.listName, props.pageSize).then( r =>{
      const batchItems: any = r.map(i=>i[0]);
      setCurrListItems(batchItems.flat());   
      setHistoryItems([batchItems.flat()]);

      const nextBatchObject: any = r.map(i=>[i[1], i[2]]);
      setNextObj(nextBatchObject);
      
      const listItemsForms  : any = [];
      batchItems.map(i=>{
        if(i.length > 0){
          listItemsForms.push({
            key: i[0].title,
            text: i[0].title
          });
        }
      });
      setFormTitles(arrayUnique(listItemsForms, 'key').sort((a, b) => a.key.localeCompare(b.key)));

      setHistoryIndex(0);
      setPreloaderVisible(false);
    });
  }, []);

  React.useEffect(()=>{
    const timeOutId = setTimeout(()=>{
      setDebouncedFitlerFields(filterFields);
    }, 200);
    return () =>{
      clearTimeout(timeOutId);
    };
  }, [filterFields]);
  React.useEffect(()=>{
    const search = () =>{
      readBatchItems(props.context, props.listUrl, props.listName, props.pageSize, debouncedFilterFields).then( r =>{
        const batchItems: any = r.map(i=>i[0]);
        setCurrListItems(batchItems.flat());   
        setHistoryItems([batchItems.flat()]);

        const nextBatchObject: any = r.map(i=>[i[1], i[2]]);
        setNextObj(nextBatchObject);

        setHistoryIndex(0);
        // setNextDisabled(r[1].nextUrl ? false : true);
      });
    };
    if (debouncedFilterFields){
      search();
    }
  }, [debouncedFilterFields]);

  const onNextClick = () =>{
    if (historyItems.length - 1 === historyIndex){
      readNextBatchItems(nextObj).then( r =>{
        const batchItems: any = r.map(i=>i[0]);
        setCurrListItems(batchItems.flat());
        
        const nextBatchObject: any = r.map(i=>[i[1], i[2]]);
        setNextObj(nextBatchObject);
        
        let historyArr = historyItems;
        historyArr.push(batchItems.flat());
        setHistoryItems(historyArr);
        setHistoryIndex(historyIndex + 1);

        const nextBatchItems: any = r.map(i=>i[1]);
        let isNext = nextDisabled;
        for (let i=0; i<nextBatchItems.length; i++){
          if (nextBatchItems[i] && nextBatchItems[i].nextUrl)
            isNext = true ;
        }
        setNextDisabled(!isNext);
        
      });
    }else{
      setHistoryIndex(historyIndex + 1);
      setCurrListItems(historyItems[historyIndex + 1]);
      if (historyItems.length - 2 === historyIndex){
        setNextDisabled(true);
      }
    }
    
  };
  const onPrevClick = () =>{
    if (historyIndex > 0){
      setHistoryIndex(historyIndex - 1);
      setCurrListItems(historyItems[historyIndex - 1]);
      setNextDisabled(false);
    }
  };

  const onChangeFilterField = (fieldNameParam: string) =>{
    return(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: any) =>{   
      setFilterFields({
        ...filterFields,
        [fieldNameParam] : text || ""
      });
    };
  };
  const resetSrch = () =>{    
    setFilterFields({
      title: {key: "", text: ""},
      formStatus: {key: "", text: ""},
      formDetails: "",
      fullName: "",
      locationNo: {key: "", text: ""},
    });
  };

  return (
    <div className={ styles.myCourses }>
      <h2>{props.wpTitle}</h2>
  
      <IFilterFields 
        filterField={filterFields} 
        onChangeFilterField={onChangeFilterField} 
        resetSrch={resetSrch}
        formTitlesOptions={formTitles}
        formLocationNosOptions={formLocationNos}
      />

      <div className={styles.pagingBtns}>
        <PrimaryButton disabled={historyIndex > 0 ? false : true} iconProps={{iconName: 'ChevronLeftMed'}} onClick={onPrevClick}/>
        <PrimaryButton disabled={nextDisabled} iconProps={{iconName: 'ChevronRightMed'}} onClick={onNextClick}/>
      </div>

      <IListItems
        // items = {listItems}
        items = {currListItems}
        preloaderVisible = {preloaderVisible}
        filterField = {filterFields}
      />
    </div>
  );
}