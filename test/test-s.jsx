import React, { Component } from 'react';
import moment from 'moment';
import { Table, Row, Col, Icon, TreeSelect, Form, Button, Modal, DatePicker, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import randomstring from 'randomstring';
import HRPagination from '../Pagniation';
import Regular from '../Form/Regular';
import Transfer from '../Form/Transfer';
import Dimission from '../Form/Dimission';
import AgainIn from '../Form/AgainIn';
import JobRelocation from '../Form/JobRelocation';
import PartTimeJob from '../Form/PartTimeJob';
import { leavePositionOfJob, getLeaveWorkerInfo, getListData, adjustJobLevel, goRegular, aginInToJob, transferPosition, getSecondPosition, deletesecondPosition } from '../../../../services/worker/worklist';
import Authorized from '../../../../utils/Authorized.js';

import WTitle from './Title';
import styles from './index.less';

import { hireType, jobStatus } from '../../../../common/constant';
import { routerRedux } from '../../../../../node_modules/dva/router';

const { TreeNode } = TreeSelect;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;

@connect(({ workerList }) => ({
  newData: workerList.listData,
  department: workerList.department,
  careerList: workerList.careerList,
  positionList: workerList.positionList,
  jobList: workerList.jobList,
  jobLevelList: workerList.jobLevelList,
  // directleaderList: workerList.directleaderList,
  orgList: workerList.orgList,
  departmentWithoutOrg: workerList.departmentWithoutOrg,
  loading: workerList.loading,
  clearALL: workerList.clearALL
}))
class WList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalType: null,
      visible: false,
      record: null,
      addPartTimeJob: false,
      currentPage: 1,
      pageSize: 10,
      directleaderList: [],
      filteredInfo: {
        positionName: null,
        hireTypes: null,
        careerName: null
      },
      leaveDate: null,
      searchText: '',
      selectValue: '',
      employeePositionInfo: {},
      entryDate: [],
      order: '',
      secondPosition: [],
      treeSelectKeys: []
    };
    ['onChange', 'optsAction', 'submitForm'].forEach(fn => {
      this[fn] = this[fn].bind(this);
    });
  }

  componentDidMount() {
    this.getDirectleaderList({
      hireType: 1,
      isLeft: 0,
      page: 1
    });
  }

  componentWillReceiveProps() {
    const { dispatch, clearALL } = this.props;
    if (clearALL) {
      this.setState({
        treeSelectKeys: [],
        filteredInfo: {
          positionName: null,
          hireTypes: null,
          careerName: null
        },
        entryDate: [],
        order: ''
      });
      dispatch({
        type: 'workerList/updateState',
        payload: { clearALL: false }
      });
    }
  }

  /* eslint class-methods-use-this: 'off' */
  onChange(e) {
    console.log(e);
  }

  onCheck = selectKeys => {
    console.log('onCheck', selectKeys);

    const { dispatch } = this.props;
    const { pageSize } = this.state;
    this.setState({ treeSelectKeys: selectKeys });
    const params = this.getQueryParamsOfState();
    const { entryDate, isLeft, positionId, hireTypes, careerId, ...rest } = params;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: 1,
        ...rest,
        entryDate: entryDate && entryDate.join(','),
        positionId: positionId && positionId.join(','),
        hireType: hireTypes && hireTypes.join(','),
        careerId: careerId && careerId.join(','),
        departmentId: selectKeys && selectKeys.join(','),
        isLeft: isLeft && isLeft.join(','),
        kw: params.searchText,
        order: params.order,
        limit: pageSize
      }
    });

    this.setState({
      currentPage: 1
    });
  };

  onRegular = params => {
    goRegular(params).then(res => {
      console.log('dedede', res);
      if (!res || res.code !== 200) return message.error(res.message);
      this.updateList();
      return message.success(intl.get("9ur8rxvzuim").d("\u64CD\u4F5C\u6210\u529F"));
    });
  };

  onClearAll = () => {
    const { dispatch } = this.props;
    const { searchText, pageSize } = this.state;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: 1,
        limit: pageSize,
        kw: searchText
      }
    });

    this.setState({
      order: '',
      currentPage: 1,
      treeSelectKeys: [],
      filteredInfo: {
        positionName: null,
        hireTypes: null,
        careerName: null
      },
      entryDate: []
    });
  };

  onSearchChange = sw => {
    const { dispatch } = this.props;
    const { pageSize } = this.state;
    const params = this.getQueryParamsOfState();
    const { entryDate, isLeft, positionId, hireTypes, departmentId, careerId, ...rest } = params;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: 1,
        ...rest,
        entryDate: entryDate && entryDate.join(','),
        positionId: positionId && positionId.join(','),
        hireType: hireTypes && hireTypes.join(','),
        careerId: careerId && careerId.join(','),
        departmentId: departmentId && departmentId.join(','),
        isLeft: isLeft && isLeft.join(','),
        kw: sw,
        order: params.order,
        limit: pageSize
      }
    });
  };

  getDirectleaderList = payload => {
    const { directleaderList } = this.state;
    getListData(payload).then(res => {
      if (!res || res.code !== 200) return;
      const array = res.data.list;

      /* eslint no-param-reassign: 'off' */
      (array || []).forEach(t => {
        t.value = t.employeeId;t.title = t.employeeName;t.key = randomstring.generate(5);
      });
      const data = [...directleaderList, ...array];

      this.setState({
        directleaderList: data
        // canpull: !!array.length,
      });
    });
  };

  getDepartmentId = keys => {
    const { department } = this.props;
    const arr = [];
    const loop = data => {
      data.forEach(item => {
        if (keys.indexOf(item.key) > -1) {
          arr.push(item.id);
        }
        if (item.children && item.children.length) {
          loop(item.children);
        }
      });
    };

    loop(department);

    return arr;
  };

  getIdOfPositionInfo = data => {
    const { employeePositionInfo } = this.state;
    const res = {
      ...employeePositionInfo,
      ...data
    };
    this.setState({
      employeePositionInfo: res
    });
  };

  getDateByFilter = (values, dateString) => {
    console.log('date', dateString);
    const { dispatch } = this.props;
    const { pageSize } = this.state;
    const params = this.getQueryParamsOfState();
    const { entryDate, isLeft, positionId, hireTypes, departmentId, careerId, ...rest } = params;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: 1,
        ...rest,
        entryDate: dateString && dateString.join(','),
        positionId: positionId && positionId.join(','),
        hireType: hireTypes && hireTypes.join(','),
        careerId: careerId && careerId.join(','),
        departmentId: departmentId && departmentId.join(','),
        isLeft: isLeft && isLeft.join(','),
        kw: params.kw,
        order: params.order,
        limit: pageSize
      }
    });
    this.setState({
      entryDate: dateString,
      currentPage: 1
    });
  };

  getQueryParamsOfState = () => {
    const {
      entryDate,
      filteredInfo: {
        positionName,
        hireTypes,
        careerName,
        isLeft
      },
      searchText,
      treeSelectKeys,
      order
    } = this.state;

    return {
      isDeptTransfer: 0,
      entryDate,
      positionId: positionName,
      hireTypes,
      careerId: careerName,
      departmentId: treeSelectKeys,
      isLeft,
      kw: searchText,
      order
    };
  };

  handleOk = () => {};

  handleCancel = () => {
    this.setState({
      visible: false,
      modalType: null,
      record: null,
      leaveDate: null
    });
  };

  cancelPartTimeJob = r => {
    const { record } = this.state;
    deletesecondPosition({ id: r.id }).then(res => {
      if (res && res.code === 200) {
        message.success(intl.get("8hd6ys3li8c").d("\u64CD\u4F5C\u6210\u529F"));
        getSecondPosition({ employeeId: record.employeeId }).then(ress => {
          if (!ress || ress.code !== 200) return message.warning(res.message);
          const { data } = ress;
          this.setState({
            secondPosition: data || []
          });
        });
      } else {
        message.success(intl.get("okd1nnwivqd").d("\u64CD\u4F5C\u5931\u8D25"));
      }
    });
  };

  handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters, asc/desc', pagination, filters, sorter);
    const { pageSize } = this.state;
    const { dispatch } = this.props;
    const o = { ascend: 'asc', descend: 'desc' };
    const params = this.getQueryParamsOfState();
    const { entryDate, positionId, hireTypes, careerId, departmentId, ...rest } = params;
    const {
      positionName,
      careerName,
      isLeft
    } = filters;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: 1,
        ...rest,
        entryDate: entryDate && entryDate.join(','),
        positionId: positionName && positionName.join(','),
        hireType: filters.hireTypes && filters.hireTypes.join(','),
        careerId: careerName && careerName.join(','),
        departmentId: departmentId && departmentId.join(','),
        isLeft: isLeft && isLeft.join(','),
        kw: params.kw,
        order: Object.keys(sorter).length ? o[sorter.order] : '',
        limit: pageSize
      }
    });
    this.setState({
      currentPage: 1,
      filteredInfo: filters,
      order: Object.keys(sorter).length ? o[sorter.order] : ''
    });
  };

  addPartTimeJob = () => {
    this.setState({
      addPartTimeJob: true
    });
  };

  updatePropsToState = payload => {
    this.setState({
      ...payload
    });
  };

  updateList = () => {
    const { currentPage, pageSize } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page: currentPage,
        limit: pageSize
      }
    });
  };

  optsAction = (record, type) => {
    const { dispatch } = this.props;
    if (type === 'update') {
      const query = {
        employeeId: record.employeeId,
        isLeft: record.isLeft,
        personId: record.personId,
        personName: record.employeeName,
        deptName: record.deptName
      };
      sessionStorage.setItem('employeeInfo', JSON.stringify(query));
      dispatch(routerRedux.push({
        pathname: '/workers/update',
        query
      }));
      return;
    }

    if (type === 'againIn') {
      getLeaveWorkerInfo({ employeeId: record.employeeId }).then(res => {
        if (res && res.code === 200) {
          const { data } = res;
          this.setState({ leaveDate: data.leaveDate });
        } else {
          this.setState({ leaveDate: '' });
        }
      });
    }

    this.setState({
      modalType: type,
      visible: true,
      record,
      addPartTimeJob: false
    });

    if (type === 'partTimeJob') {
      getSecondPosition({ employeeId: record.employeeId }).then(res => {
        if (!res || res.code !== 200) return message.warning(res.message);
        const { data } = res;
        this.setState({
          secondPosition: data || []
        });
      });
    }
  };

  paginationChange = (page, pageSize) => {
    const { dispatch } = this.props;
    this.setState({
      currentPage: page,
      pageSize
    });
    const { order } = this.state;
    const params = this.getQueryParamsOfState();
    const { entryDate, positionId, isLeft, hireTypes, careerId, departmentId, ...rest } = params;
    dispatch({
      type: 'workerList/getListData',
      payload: {
        page,
        ...rest,
        entryDate: entryDate && entryDate.join(','),
        positionId: positionId && positionId.join(','),
        hireType: hireTypes && hireTypes.join(','),
        careerId: careerId && careerId.join(','),
        departmentId: departmentId && departmentId.join(','),
        isLeft: isLeft && isLeft.join(','),
        kw: params.kw,
        order: order || '',
        limit: pageSize
      }
    });
  };

  leaveJob = params => {
    leavePositionOfJob(params).then(res => {
      if (!res || res.code !== 200) return message.error(res.message);
      this.updateList();
      return message.success(intl.get("0a06jgn85ky7").d("\u64CD\u4F5C\u6210\u529F"));
    });
  };

  againInJob = params => {
    aginInToJob(params).then(res => {
      if (!res || res.code !== 200) return message.error(res.message);
      this.updateList();
      return message.success(intl.get("1jse0afntfe").d("\u64CD\u4F5C\u6210\u529F"));
    });
  };

  doTransferPosition = params => {
    transferPosition(params).then(res => {
      if (!res || res.code !== 200) return message.error(res.message);
      this.updateList();
      return message.success(intl.get("7ugsupinud7").d("\u64CD\u4F5C\u6210\u529F"));
    });
  };

  jobRelocation = params => {
    adjustJobLevel(params).then(res => {
      if (!res || res.code !== 200) return message.error(res.message);
      this.updateList();
      return message.success(intl.get("292mfmh1vbl").d("\u64CD\u4F5C\u6210\u529F"));
    });
  };

  submitForm() {
    const { record, modalType, employeePositionInfo, directleaderList } = this.state;
    const { form, careerList, jobList, jobLevelList, department, positionList } = this.props;
    const getFieldById = (field, arr, id, checkField = 'id') => {
      let temp;
      const loop = data => {
        data.forEach(item => {
          if (temp) return;
          if (item[checkField] === id) temp = item[field];
          if (item.children && item.children.length) loop(item.children);
        });
      };
      loop(arr);
      return temp;
    };
    const actionObj = {
      regular: this.onRegular,
      transfer: this.doTransferPosition,
      dimission: this.leaveJob,
      againIn: this.againInJob,
      jobRelocation: this.jobRelocation,
      partTimeJob: this.doTransferPosition
    };

    form.validateFields((err, values) => {
      console.log('Received values of form: ', values, record);
      let params = {};
      if (!err) {
        if (modalType === 'dimission') {
          params = {
            employeeId: record.employeeId,
            leaveType: values.leaveType,
            leaveDate: moment(values.leaveDate).format('x'),
            leaveReason: values.leaveReason
          };
        }
        if (modalType === 'jobRelocation') {

          params = {
            employeeId: record.employeeId,
            careerId: values.careerId,
            careerName: getFieldById('title', careerList, values.careerId),
            jobId: values.jobId,
            jobName: getFieldById('title', jobList, values.jobId),
            jobLevelId: values.jobLevelId,
            jobLevelName: getFieldById('title', jobLevelList, values.jobLevelId),
            changeType: values.changeType,
            changeReason: values.changeReason,
            effectiveDate: moment(values.effectiveDate).format('x')
          };
        }
        if (modalType === 'regular' || modalType === 'againIn') {
          params = {
            employeeId: record.employeeId,
            hireType: values.hireType,
            jobInfo: {
              careerId: values.careerId,
              careerName: getFieldById('title', careerList, values.careerId),
              jobId: values.jobId,
              jobName: getFieldById('title', jobList, values.jobId),
              jobLevelId: values.jobLevelId,
              jobLevelName: getFieldById('title', jobLevelList, values.jobLevelId)
            },

            positionInfo: {
              id: employeePositionInfo.id,
              deptId: values.deptId,
              deptName: getFieldById('title', department, values.deptId),
              positionId: values.positionId,
              positionName: getFieldById('title', positionList, values.positionId),
              directLeaderId: values.directLeaderId,
              directLeaderName: getFieldById('title', directleaderList, values.directLeaderId, 'employeeId'),
              orgId: values.orgId,
              orgName: getFieldById('title', department, values.orgId),
              chargerId: employeePositionInfo.chargerId,
              chargerName: employeePositionInfo.chargerName
            },
            effectiveDate: moment(values.effectiveDate).format('x'),
            nip: {
              cardNumber: values.cardNumber,
              signPlace: values.signOrg
            }
          };
          /* eslint dot-notation: 'off' */
          if (modalType === 'againIn') delete params['nip'];
        }
        if (modalType === 'transfer' || modalType === 'partTimeJob') {
          params = {
            employeeId: record.employeeId,
            id: employeePositionInfo.id,
            deptId: values.deptId,
            deptName: getFieldById('title', department, values.deptId),
            positionId: values.positionId,
            positionName: getFieldById('title', positionList, values.positionId),
            directLeaderId: values.directLeaderId,
            directLeaderName: getFieldById('title', directleaderList, values.directLeaderId, 'employeeId'),
            orgId: values.orgId,
            orgName: getFieldById('title', department, values.orgId),
            chargerId: employeePositionInfo.chargerId,
            chargerName: employeePositionInfo.chargerName,
            changeType: values.changeType,
            changeReason: values.changeReason,
            effectiveDate: moment(values.effectiveDate).format('x')
          };

          if (modalType === 'partTimeJob') {
            params.changeType = 2;
            delete params['changeReason'];
            delete params['id'];
          }
        }

        actionObj[modalType](params);

        this.setState({
          addPartTimeJob: false,
          visible: false,
          modalType: null,
          record: null,
          employeePositionInfo: {},
          secondPosition: []
        });
      }
    });
  }

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return <TreeNode title={item.title} value={item.value} key={item.key}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>;
      }
      return <TreeNode {...item} />;
    });
  };

  render() {
    const { newData, department, careerList, positionList, dispatch, loading } = this.props;
    const {
      modalType, visible, currentPage, pageSize, addPartTimeJob, leaveDate,
      treeSelectKeys, selectValue, searchText, record, entryDate, secondPosition
    } = this.state;
    let { filteredInfo } = this.state;
    filteredInfo = filteredInfo || {};
    const { form } = this.props;

    const content = getRecord => {
      const dimission = <Authorized authority={["hr_person_resignation"]} noMatch={null}>
          <i title={intl.get("u9bew2o0lh").d("\u79BB\u804C")} className="iconfont icon-lizhi2" onClick={() => this.optsAction(getRecord, 'dimission')} />
        </Authorized>;

      const transfer = <Authorized authority={["hr_person_transferLevel"]} noMatch={null}>
          <i title={intl.get("zmfgmy6xve").d("\u8C03\u5C97")} className="iconfont icon-tiaoxintiaogang1" onClick={() => this.optsAction(getRecord, 'transfer')} />
        </Authorized>;

      const jobRelocation = <Authorized authority={["hr_person_transferPosition"]} noMatch={null}>
          <i title={intl.get("589e6pv6il").d("\u8C03\u804C\u7EA7")} className="iconfont icon-tiaoxian" onClick={() => this.optsAction(getRecord, 'jobRelocation')} />
        </Authorized>;

      const partTimeJob = <Authorized authority={["hr_person_concurrentPosition"]} noMatch={null}>
          <i title={intl.get("m03iq26zo3").d("\u517C\u5C97")} className="iconfont icon-jiangangjiangangrenyuan" onClick={() => this.optsAction(getRecord, 'partTimeJob')} />
        </Authorized>;

      const regular = <Authorized authority={["hr_person_regular"]} noMatch={null}>
          <i title={intl.get("9euw27nv4o8").d("\u8F6C\u6B63\u5F0F")} className="iconfont icon-zhuanzheng1" onClick={() => this.optsAction(getRecord, 'regular')} />
        </Authorized>;

      const againIn = <Authorized authority={["hr_person_reentry"]} noMatch={null}>
          <i title={intl.get("9po037qpyl").d("\u518D\u5165\u804C")} className="iconfont icon-zairuzhi1" onClick={() => this.optsAction(getRecord, 'againIn')} />
        </Authorized>;

      const formalOpt = <span className={styles.formalOpt}>
          {dimission}
          {transfer}
          {jobRelocation}
          {partTimeJob}
        </span>;

      const unformalOpt = <span className={styles.formalOpt}>
          {regular}
          {dimission}
        </span>;

      const again = <span className={styles.formalOpt}>
          {againIn}
        </span>;

      if (getRecord.isLeft === 0) {
        if (getRecord.hireType === 1) {
          return formalOpt;
        }
        return unformalOpt;
      }

      return again;
    };

    const columns = [{
      title: intl.get("3ehzxzbyvyw").d("\u59D3\u540D"),
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: '9%',
      render: (text, getRecord) => {
        return <Authorized authority={['hr_person_view', 'hr_person_edit']} noMatch={<span className={styles.optsAction}>{text}</span>}>
            <a className={styles.optsAction} onClick={() => this.optsAction(getRecord, 'update')}>{text}</a>
          </Authorized>;
      }
    }, {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: '8%'
    }, {
      title: intl.get("33l0cuxt8hv").d("\u8058\u7528\u5F62\u5F0F"),
      dataIndex: 'hireType',
      filters: hireType,
      filteredValue: filteredInfo.hireTypes || null,
      filterIcon: filtered => <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
      key: 'hireTypes',
      width: '9%',
      render: text => {
        let str;
        hireType.forEach(item => {
          if (item.value === text) str = item.title;
        });
        return <span>{str}</span>;
      }
    }, {
      title: intl.get("al1p9ly7ug6").d("\u90E8\u95E8"),
      dataIndex: 'deptName',
      key: 'deptName',
      width: '9%',
      filterDropdown: () => <div className="custom-filter-dropdown">
          <TreeSelect showSearch style={{ width: 300 }} value={treeSelectKeys} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} getPopupContainer={() => document.querySelector('.custom-filter-dropdown')} allowClear multiple onChange={this.onCheck}>
            {this.renderTreeNodes(department)}
          </TreeSelect>
        </div>,
      filterIcon: () => <Icon type="filter" style={{ color: treeSelectKeys.length ? '#108ee9' : '#aaa' }} />
    }, {
      title: intl.get("s8cl1jdmi4d").d("\u804C\u4E1A\u751F\u6DAF"),
      dataIndex: 'careerName',
      key: 'careerName',
      filters: careerList,
      filteredValue: filteredInfo.careerName || null,
      width: '9%',
      filterIcon: filtered => <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />
    }, {
      title: intl.get("0i0gxjl80yc9").d("\u804C\u7EA7"),
      dataIndex: 'jobLevelName',
      key: 'jobLevelName',
      width: '9%'
    }, {
      title: intl.get("23v8no9erc7").d("\u5C97\u4F4D"),
      dataIndex: 'positionName',
      key: 'positionName',
      width: '9%',
      filters: positionList,
      filteredValue: filteredInfo.positionName || null,
      filterIcon: filtered => <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />
    }, {
      title: intl.get("6b19hk2z2hk").d("\u5165\u804C\u65E5\u671F"),
      dataIndex: 'entryDate',
      key: 'entryDate',
      filterDropdown: () => {
        return <div className="custom-filter-dropdown">
            <RangePicker onChange={this.getDateByFilter} />
          </div>;
      },
      filterIcon: () => <Icon type="filter" style={{ color: entryDate.length ? '#108ee9' : '#aaa' }} />,
      sorter: (a, b) => a.entryDate - b.entryDate,
      render: text => {
        return <span>{moment(text).format(dateFormat)}</span>;
      }
    }, {
      title: intl.get("be5nl03buod").d("\u5728\u804C\u72B6\u6001"),
      dataIndex: 'isLeft',
      key: 'isLeft',
      filters: jobStatus,
      width: '9%',
      filteredValue: filteredInfo.isLeft || null,
      filterIcon: filtered => <Icon type="filter" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
      render: text => {
        let str;
        jobStatus.forEach(item => {
          if (item.value === text) str = intl.get("eos0l22lfo").d("\u4F60\u4F60\u4F60");
        });
        return <span>{str}</span>;
      }
    }, {
      title: intl.get("s13f5poznjd").d("\u64CD\u4F5C"),
      dataIndex: 'opts',
      key: 'opts',
      width: 180,
      render: (text, listRecord) => {
        return <span>{content(listRecord)}</span>;
      }
    }];
    const columnsJob = [{
      title: intl.get("3gssrymd0fl").d("\u7EC4\u7EC7\u673A\u6784"),
      dataIndex: 'orgName',
      key: 'orgName'
    }, {
      title: intl.get("7wkrjrnwc3l").d("\u90E8\u95E8"),
      dataIndex: 'deptName',
      key: 'deptName'
    }, {
      title: intl.get("ztkxmvnn6vh").d("\u5C97\u4F4D"),
      dataIndex: 'positionName',
      key: 'positionName'
    }, {
      title: intl.get("uyj0ay587f").d("\u76F4\u63A5\u4E0A\u7EA7"),
      dataIndex: 'directLeaderName',
      key: 'directLeaderName'
    }, {
      title: intl.get("fdsy7zju6sl").d("\u4E3B\u7BA1\u4EBA\u5458"),
      dataIndex: 'chargerName',
      key: 'chargerName'
    }, {
      title: intl.get("2enfcyc1we7").d("\u751F\u6548\u65E5\u671F"),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: text => {
        if (!text) return '';
        return <span>{moment(text).format(dateFormat)}</span>;
      }
    }, {
      title: intl.get("k85xcz6isdc").d("\u64CD\u4F5C"),
      dataIndex: 'opts',
      key: 'opts',
      render: (text, recordData) => {
        return <Popconfirm title={intl.get("4mj42b89r7b").d("\u786E\u5B9A\u8981\u53D6\u6D88\u517C\u5C97\u5417?")} onConfirm={() => this.cancelPartTimeJob(recordData)}>
            <span><a className={styles.optsAction}>{intl.get("ccqsu575w39").d("\u53D6\u6D88\u517C\u5C97")}</a></span>
          </Popconfirm>;
      }
    }];
    const modalTitle = {
      regular: intl.get("8rrdk5yeuxu").d("\u8F6C\u6B63\u5F0F"),
      transfer: intl.get("0ca3mc54i1z9").d("\u8C03\u5C97"),
      dimission: intl.get("p4j2duvub9").d("\u79BB\u804C"),
      againIn: intl.get("53rci26fps3").d("\u518D\u5165\u804C"),
      jobRelocation: intl.get("nu2zaxzsg1m").d("\u8C03\u804C\u7EA7"),
      partTimeJob: intl.get("dkotwj66b9r").d("\u517C\u5C97")
    };
    const getFormByType = formType => {
      if (formType === 'regular') return <Regular getIdOfPositionInfo={this.getIdOfPositionInfo} record={record} form={form} getFieldDecorator={form.getFieldDecorator} />;
      if (formType === 'transfer') return <Transfer form={form} getIdOfPositionInfo={this.getIdOfPositionInfo} record={record} getFieldDecorator={form.getFieldDecorator} />;
      if (formType === 'dimission') return <Dimission getFieldDecorator={form.getFieldDecorator} />;
      if (formType === 'againIn') return <AgainIn form={form} record={record} getIdOfPositionInfo={this.getIdOfPositionInfo} getFieldDecorator={form.getFieldDecorator} />;
      if (formType === 'jobRelocation') return <JobRelocation form={form} record={record} getFieldDecorator={form.getFieldDecorator} />;
      if (formType === 'partTimeJob') {
        return addPartTimeJob ? <PartTimeJob getIdOfPositionInfo={this.getIdOfPositionInfo} form={form} getFieldDecorator={form.getFieldDecorator} /> : <div style={{ paddingBottom: 50 }}>
              <Button style={{ marginBottom: 10 }} type="primary" onClick={this.addPartTimeJob}>{intl.get("z4cpafm7df").d("\u65B0\u589E\u517C\u5C97")}</Button>
              <div className={styles.partTimeJobTable}>
                <Table dataSource={secondPosition} size="middle" pagination={false} columns={columnsJob} />
              </div>
            </div>;
      }
    };

    return <div>
        {}
        <div>
          <div>
            <WTitle onClearAll={this.onClearAll} searchText={searchText} selectValue={selectValue} dispatch={dispatch} updatePropsToState={this.updatePropsToState} listTotal={newData.totalCount || 0} onSearchChange={this.onSearchChange} />
          </div>
        </div>
        <div className={styles.tableArea}>
          <Table loading={loading} onChange={this.handleChange} dataSource={newData.list || []} pagination={false} columns={columns} />
        </div>
        <HRPagination currentPage={currentPage} pageSize={pageSize} listTotal={newData.totalCount} onChange={(page, size) => {
        this.paginationChange(page, size);
      }} />
        <Modal visible={visible} title={modalTitle[modalType]} onOk={this.submitForm.bind(this)} width={1200} onCancel={this.handleCancel} footer={!addPartTimeJob && modalType === 'partTimeJob' ? null : [<Button className={styles.submitModal} key="submit" type="primary" onClick={this.submitForm.bind(this)}>{intl.get("29u8y3ohj6h").d("\u63D0\u4EA4")}</Button>, <Button className={styles.submitModal} style={{ marginLeft: 15 }} key="back" onClick={this.handleCancel}>{intl.get("ca53n1hjzo").d("\u5173\u95ED")}</Button>]}>
          {record ? <Row className={styles.userInfoTitle} type="flex" justify="space-between">
                <Col span={3} className={styles.userName}>{record.employeeName}</Col>
                <Col span={7}>{intl.get("lid0khitp8").d("\u804C\u4E1A\u751F\u6DAF\uFF1A")}{record.careerName}</Col>
                <Col span={7}>{intl.get("aeubbprwdr").d("\u804C\u7EA7\uFF1A")}{record.jobLevelName}</Col>
                <Col span={7}>{modalType === 'againIn' ? `离职日期：${moment(leaveDate).format(dateFormat)}` : `入职日期：${moment(record.entryDate).format(dateFormat)}`} </Col>
                <Col offset={3} span={7}>{intl.get("r6bt8hhet1n").d("\u90E8\u95E8\uFF1A")}{record.deptName}</Col>
                <Col span={7}>{intl.get("g4iq5qwxubv").d("\u5C97\u4F4D\uFF1A")}{record.positionName}</Col>
                <Col span={7} />
              </Row> : null}
          
          <div className={styles.modalForm}>
            <Form>
              {modalType && getFormByType(modalType)}
            </Form>
          </div>
        </Modal>
      </div>;
  }
}

export default Form.create()(WList);