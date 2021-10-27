import * as React from 'react';
import {IFilterFieldsProps} from './IFilterFieldsProps';
import {Stack, IStackProps, IStackStyles, SearchBox, ActionButton, initializeIcons, ComboBox, IComboBoxOption, Icon} from 'office-ui-fabric-react';
import styles from '../MyCourses.module.scss';
import {isObjectEmpty} from '../../Services/DataRequests';

export default function IFilterFields (props: IFilterFieldsProps) {
    
    initializeIcons();
    const stackTokens = { childrenGap: 50 };
    const stackStyles: Partial<IStackStyles> = { root: { width: '100%' } };
    const columnProps: Partial<IStackProps> = {
        tokens: { childrenGap: 15 },
        styles: { root: { width: '50%' } },
    };

    const options: IComboBoxOption[] = [
        { key: 'New', text: 'New' },
        { key: 'Completed', text: 'Completed' },
        { key: 'Department_Accepted', text: 'Accepted by the Department' },
        { key: 'Department_Rejected', text: 'Rejected by the Department' },
        { key: 'Approver1_Accepted', text: 'Accepted by Approver' },
        { key: 'Approver1_Rejected', text: 'Rejected by Approver' },
        { key: 'Submitted', text: 'In Progress for Approval' },
        { key: 'Superintendent_Accepted', text: 'Accepted by Superintendent' },
        { key: 'Superintendent_Rejected', text: 'Rejected by Superintendent' },
        { key: 'Other', text: 'Other' },
    ];

    
    return(
        <div className={styles.filterForm}>            
            <ActionButton 
                className={styles.resetSrchBtn}
                text="Reset" 
                onClick={props.resetSrch} 
                iconProps={{ iconName: 'ClearFilter' }}
                allowDisabledFocus 
                disabled = {isObjectEmpty(props.filterField)}
            />
            <div>
                <Stack horizontal tokens={stackTokens} styles={stackStyles}>
                    <Stack {...columnProps}>                        
                        {/* <SearchBox 
                            placeholder="Form Title" 
                            underlined
                            value={props.filterField.title}
                            onChange={props.onChangeFilterField("title")}
                            iconProps={{ iconName: 'Rename' }}
                        /> */}
                        <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="Rename" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="Form Title"
                                options={props.formTitlesOptions} 
                                onChange={props.onChangeFilterField("title")}
                                selectedKey={props.filterField.title.key}                            
                            />
                        </div>
                        <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="Location" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="All locations for me"
                                options={props.formLocationNosOptions} 
                                onChange={props.onChangeFilterField("locationNo")}
                                selectedKey={props.filterField.locationNo.key}                            
                            />
                        </div>
                        <div className={styles.comboCntnr}>
                            <Icon className={styles.comboIcon} iconName="StackedLineChart" />
                            <ComboBox
                                className={styles.comboStyle}
                                placeholder="Status"
                                options={options} 
                                onChange={props.onChangeFilterField("formStatus")}
                                selectedKey={props.filterField.formStatus.key}                            
                            />
                        </div>
                        
                    </Stack>
                    <Stack {...columnProps}>
                        {/* <SearchBox 
                            placeholder="Status"
                            underlined 
                            value={props.filterField.formStatus.text} 
                            onChange={props.onChangeFilterField("formStatus")}
                            iconProps={{iconName: 'StackedLineChart'}}
                        /> */}
                        <SearchBox 
                            placeholder="Employee Name" 
                            value={props.filterField.fullName}
                            onChange={props.onChangeFilterField("fullName")}
                            iconProps={{ iconName: 'Contact' }}
                            // showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                        <SearchBox 
                            placeholder="Form Details" 
                            value={props.filterField.formDetails}
                            onChange={props.onChangeFilterField("formDetails")}
                            iconProps={{ iconName: 'GlobalNavButton' }}
                            // showIcon={true}
                            underlined
                            className={styles.srchBox}
                        />
                    </Stack>
                </Stack>
            </div>
        </div>
    );
}