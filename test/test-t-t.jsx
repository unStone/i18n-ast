var _extends = Object.assign || (function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; });

var _dec, _class;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
let WList = (_dec = connect(({ workerList }) => ({
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
})), _dec(_class = class WList extends Component {
  constructor(props) {
    super(props);

    this.onCheck = selectKeys => {
      console.log('onCheck', selectKeys);

      const { dispatch } = this.props;
      const { pageSize } = this.state;
      this.setState({ treeSelectKeys: selectKeys });
      const params = this.getQueryParamsOfState();
      const { entryDate, isLeft, positionId, hireTypes, careerId } = params,
            rest = _objectWithoutProperties(params, ['entryDate', 'isLeft', 'positionId', 'hireTypes', 'careerId']);
      dispatch({
        type: 'workerList/getListData',
        payload: _extends({
          page: 1
        }, rest, {
          entryDate: entryDate && entryDate.join(','),
          positionId: positionId && positionId.join(','),
          hireType: hireTypes && hireTypes.join(','),
          careerId: careerId && careerId.join(','),
          departmentId: selectKeys && selectKeys.join(','),
          isLeft: isLeft && isLeft.join(','),
          kw: params.searchText,
          order: params.order,
          limit: pageSize
        })
      });

      this.setState({
        currentPage: 1
      });
    };

    this.onRegular = params => {
      goRegular(params).then(res => {
        console.log('dedede', res);
        if (!res || res.code !== 200) return message.error(res.message);
        this.updateList();
        return message.success('操作成功');
      });
    };

    this.onClearAll = () => {
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

    this.onSearchChange = sw => {
      const { dispatch } = this.props;
      const { pageSize } = this.state;
      const params = this.getQueryParamsOfState();
      const { entryDate, isLeft, positionId, hireTypes, departmentId, careerId } = params,
            rest = _objectWithoutProperties(params, ['entryDate', 'isLeft', 'positionId', 'hireTypes', 'departmentId', 'careerId']);
      dispatch({
        type: 'workerList/getListData',
        payload: _extends({
          page: 1
        }, rest, {
          entryDate: entryDate && entryDate.join(','),
          positionId: positionId && positionId.join(','),
          hireType: hireTypes && hireTypes.join(','),
          careerId: careerId && careerId.join(','),
          departmentId: departmentId && departmentId.join(','),
          isLeft: isLeft && isLeft.join(','),
          kw: sw,
          order: params.order,
          limit: pageSize
        })
      });
    };

    this.getDirectleaderList = payload => {
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

    this.getDepartmentId = keys => {
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

    this.getIdOfPositionInfo = data => {
      const { employeePositionInfo } = this.state;
      const res = _extends({}, employeePositionInfo, data);
      this.setState({
        employeePositionInfo: res
      });
    };

    this.getDateByFilter = (values, dateString) => {
      console.log('date', dateString);
      const { dispatch } = this.props;
      const { pageSize } = this.state;
      const params = this.getQueryParamsOfState();
      const { entryDate, isLeft, positionId, hireTypes, departmentId, careerId } = params,
            rest = _objectWithoutProperties(params, ['entryDate', 'isLeft', 'positionId', 'hireTypes', 'departmentId', 'careerId']);
      dispatch({
        type: 'workerList/getListData',
        payload: _extends({
          page: 1
        }, rest, {
          entryDate: dateString && dateString.join(','),
          positionId: positionId && positionId.join(','),
          hireType: hireTypes && hireTypes.join(','),
          careerId: careerId && careerId.join(','),
          departmentId: departmentId && departmentId.join(','),
          isLeft: isLeft && isLeft.join(','),
          kw: params.kw,
          order: params.order,
          limit: pageSize
        })
      });
      this.setState({
        entryDate: dateString,
        currentPage: 1
      });
    };

    this.getQueryParamsOfState = () => {
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

    this.handleOk = () => {};

    this.handleCancel = () => {
      this.setState({
        visible: false,
        modalType: null,
        record: null,
        leaveDate: null
      });
    };

    this.cancelPartTimeJob = r => {
      const { record } = this.state;
      deletesecondPosition({ id: r.id }).then(res => {
        if (res && res.code === 200) {
          message.success('操作成功');
          getSecondPosition({ employeeId: record.employeeId }).then(ress => {
            if (!ress || ress.code !== 200) return message.warning(res.message);
            const { data } = ress;
            this.setState({
              secondPosition: data || []
            });
          });
        } else {
          message.success('操作失败');
        }
      });
    };

    this.handleChange = (pagination, filters, sorter) => {
      console.log('Various parameters, asc/desc', pagination, filters, sorter);
      const { pageSize } = this.state;
      const { dispatch } = this.props;
      const o = { ascend: 'asc', descend: 'desc' };
      const params = this.getQueryParamsOfState();
      const { entryDate, positionId, hireTypes, careerId, departmentId } = params,
            rest = _objectWithoutProperties(params, ['entryDate', 'positionId', 'hireTypes', 'careerId', 'departmentId']);
      const {
        positionName,
        careerName,
        isLeft
      } = filters;
      dispatch({
        type: 'workerList/getListData',
        payload: _extends({
          page: 1
        }, rest, {
          entryDate: entryDate && entryDate.join(','),
          positionId: positionName && positionName.join(','),
          hireType: filters.hireTypes && filters.hireTypes.join(','),
          careerId: careerName && careerName.join(','),
          departmentId: departmentId && departmentId.join(','),
          isLeft: isLeft && isLeft.join(','),
          kw: params.kw,
          order: Object.keys(sorter).length ? o[sorter.order] : '',
          limit: pageSize
        })
      });
      this.setState({
        currentPage: 1,
        filteredInfo: filters,
        order: Object.keys(sorter).length ? o[sorter.order] : ''
      });
    };

    this.addPartTimeJob = () => {
      this.setState({
        addPartTimeJob: true
      });
    };

    this.updatePropsToState = payload => {
      this.setState(_extends({}, payload));
    };

    this.updateList = () => {
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

    this.optsAction = (record, type) => {
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

    this.paginationChange = (page, pageSize) => {
      const { dispatch } = this.props;
      this.setState({
        currentPage: page,
        pageSize
      });
      const { order } = this.state;
      const params = this.getQueryParamsOfState();
      const { entryDate, positionId, isLeft, hireTypes, careerId, departmentId } = params,
            rest = _objectWithoutProperties(params, ['entryDate', 'positionId', 'isLeft', 'hireTypes', 'careerId', 'departmentId']);
      dispatch({
        type: 'workerList/getListData',
        payload: _extends({
          page
        }, rest, {
          entryDate: entryDate && entryDate.join(','),
          positionId: positionId && positionId.join(','),
          hireType: hireTypes && hireTypes.join(','),
          careerId: careerId && careerId.join(','),
          departmentId: departmentId && departmentId.join(','),
          isLeft: isLeft && isLeft.join(','),
          kw: params.kw,
          order: order || '',
          limit: pageSize
        })
      });
    };

    this.leaveJob = params => {
      leavePositionOfJob(params).then(res => {
        if (!res || res.code !== 200) return message.error(res.message);
        this.updateList();
        return message.success('操作成功');
      });
    };

    this.againInJob = params => {
      aginInToJob(params).then(res => {
        if (!res || res.code !== 200) return message.error(res.message);
        this.updateList();
        return message.success('操作成功');
      });
    };

    this.doTransferPosition = params => {
      transferPosition(params).then(res => {
        if (!res || res.code !== 200) return message.error(res.message);
        this.updateList();
        return message.success('操作成功');
      });
    };

    this.jobRelocation = params => {
      adjustJobLevel(params).then(res => {
        if (!res || res.code !== 200) return message.error(res.message);
        this.updateList();
        return message.success('操作成功');
      });
    };

    this.renderTreeNodes = data => {
      return data.map(item => {
        if (item.children) {
          return React.createElement(
            TreeNode,
            { title: item.title, value: item.value, key: item.key },
            this.renderTreeNodes(item.children)
          );
        }
        return React.createElement(TreeNode, item);
      });
    };

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
      const dimission = React.createElement(
        Authorized,
        { authority: ["hr_person_resignation"], noMatch: null },
        React.createElement('i', {
          title: '\u79BB\u804C',
          className: 'iconfont icon-lizhi2',
          onClick: () => this.optsAction(getRecord, 'dimission')
        })
      );

      const transfer = React.createElement(
        Authorized,
        { authority: ["hr_person_transferLevel"], noMatch: null },
        React.createElement('i', {
          title: '\u8C03\u5C97',
          className: 'iconfont icon-tiaoxintiaogang1',
          onClick: () => this.optsAction(getRecord, 'transfer')
        })
      );

      const jobRelocation = React.createElement(
        Authorized,
        { authority: ["hr_person_transferPosition"], noMatch: null },
        React.createElement('i', {
          title: '\u8C03\u804C\u7EA7',
          className: 'iconfont icon-tiaoxian',
          onClick: () => this.optsAction(getRecord, 'jobRelocation')
        })
      );

      const partTimeJob = React.createElement(
        Authorized,
        { authority: ["hr_person_concurrentPosition"], noMatch: null },
        React.createElement('i', {
          title: '\u517C\u5C97',
          className: 'iconfont icon-jiangangjiangangrenyuan',
          onClick: () => this.optsAction(getRecord, 'partTimeJob')
        })
      );

      const regular = React.createElement(
        Authorized,
        { authority: ["hr_person_regular"], noMatch: null },
        React.createElement('i', {
          title: '\u8F6C\u6B63\u5F0F',
          className: 'iconfont icon-zhuanzheng1',
          onClick: () => this.optsAction(getRecord, 'regular')
        })
      );

      const againIn = React.createElement(
        Authorized,
        { authority: ["hr_person_reentry"], noMatch: null },
        React.createElement('i', {
          title: '\u518D\u5165\u804C',
          className: 'iconfont icon-zairuzhi1',
          onClick: () => this.optsAction(getRecord, 'againIn')
        })
      );

      const formalOpt = React.createElement(
        'span',
        { className: styles.formalOpt },
        dimission,
        transfer,
        jobRelocation,
        partTimeJob
      );

      const unformalOpt = React.createElement(
        'span',
        { className: styles.formalOpt },
        regular,
        dimission
      );

      const again = React.createElement(
        'span',
        { className: styles.formalOpt },
        againIn
      );

      if (getRecord.isLeft === 0) {
        if (getRecord.hireType === 1) {
          return formalOpt;
        }
        return unformalOpt;
      }

      return again;
    };

    const columns = [{
      title: '姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: '9%',
      render: (text, getRecord) => {
        return React.createElement(
          Authorized,
          {
            authority: ['hr_person_view', 'hr_person_edit'],
            noMatch: React.createElement(
              'span',
              { className: styles.optsAction },
              text
            )
          },
          React.createElement(
            'a',
            { className: styles.optsAction, onClick: () => this.optsAction(getRecord, 'update') },
            text
          )
        );
      }
    }, {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: '8%'
    }, {
      title: '聘用形式',
      dataIndex: 'hireType',
      filters: hireType,
      filteredValue: filteredInfo.hireTypes || null,
      filterIcon: filtered => React.createElement(Icon, { type: 'filter', style: { color: filtered ? '#108ee9' : '#aaa' } }),
      key: 'hireTypes',
      width: '9%',
      render: text => {
        let str;
        hireType.forEach(item => {
          if (item.value === text) str = item.title;
        });
        return React.createElement(
          'span',
          null,
          str
        );
      }
    }, {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: '9%',
      filterDropdown: () => React.createElement(
        'div',
        { className: 'custom-filter-dropdown' },
        React.createElement(
          TreeSelect,
          {
            showSearch: true,
            style: { width: 300 },
            value: treeSelectKeys,
            dropdownStyle: { maxHeight: 400, overflow: 'auto' },
            getPopupContainer: () => document.querySelector('.custom-filter-dropdown'),
            allowClear: true,
            multiple: true,
            onChange: this.onCheck
          },
          this.renderTreeNodes(department)
        )
      ),
      filterIcon: () => React.createElement(Icon, { type: 'filter', style: { color: treeSelectKeys.length ? '#108ee9' : '#aaa' } })
    }, {
      title: '职业生涯',
      dataIndex: 'careerName',
      key: 'careerName',
      filters: careerList,
      filteredValue: filteredInfo.careerName || null,
      width: '9%',
      filterIcon: filtered => React.createElement(Icon, { type: 'filter', style: { color: filtered ? '#108ee9' : '#aaa' } })
    }, {
      title: '职级',
      dataIndex: 'jobLevelName',
      key: 'jobLevelName',
      width: '9%'
    }, {
      title: '岗位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: '9%',
      filters: positionList,
      filteredValue: filteredInfo.positionName || null,
      filterIcon: filtered => React.createElement(Icon, { type: 'filter', style: { color: filtered ? '#108ee9' : '#aaa' } })
    }, {
      title: '入职日期',
      dataIndex: 'entryDate',
      key: 'entryDate',
      filterDropdown: () => {
        return React.createElement(
          'div',
          { className: 'custom-filter-dropdown' },
          React.createElement(RangePicker, { onChange: this.getDateByFilter })
        );
      },
      filterIcon: () => React.createElement(Icon, { type: 'filter', style: { color: entryDate.length ? '#108ee9' : '#aaa' } }),
      sorter: (a, b) => a.entryDate - b.entryDate,
      render: text => {
        return React.createElement(
          'span',
          null,
          moment(text).format(dateFormat)
        );
      }
    }, {
      title: '在职状态',
      dataIndex: 'isLeft',
      key: 'isLeft',
      filters: jobStatus,
      width: '9%',
      filteredValue: filteredInfo.isLeft || null,
      filterIcon: filtered => React.createElement(Icon, { type: 'filter', style: { color: filtered ? '#108ee9' : '#aaa' } }),
      render: text => {
        let str;
        jobStatus.forEach(item => {
          if (item.value === text) str = item.title;
        });
        return React.createElement(
          'span',
          null,
          str
        );
      }
    }, {
      title: '操作',
      dataIndex: 'opts',
      key: 'opts',
      width: 180,
      render: (text, listRecord) => {
        return React.createElement(
          'span',
          null,
          content(listRecord)
        );
      }
    }];
    const columnsJob = [{
      title: '组织机构',
      dataIndex: 'orgName',
      key: 'orgName'
    }, {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName'
    }, {
      title: '岗位',
      dataIndex: 'positionName',
      key: 'positionName'
    }, {
      title: '直接上级',
      dataIndex: 'directLeaderName',
      key: 'directLeaderName'
    }, {
      title: '主管人员',
      dataIndex: 'chargerName',
      key: 'chargerName'
    }, {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: text => {
        if (!text) return '';
        return React.createElement(
          'span',
          null,
          moment(text).format(dateFormat)
        );
      }
    }, {
      title: '操作',
      dataIndex: 'opts',
      key: 'opts',
      render: (text, recordData) => {
        return React.createElement(
          Popconfirm,
          { title: '\u786E\u5B9A\u8981\u53D6\u6D88\u517C\u5C97\u5417?', onConfirm: () => this.cancelPartTimeJob(recordData) },
          React.createElement(
            'span',
            null,
            React.createElement(
              'a',
              { className: styles.optsAction },
              '\u53D6\u6D88\u517C\u5C97'
            )
          )
        );
      }
    }];
    const modalTitle = {
      regular: '转正式',
      transfer: '调岗',
      dimission: '离职',
      againIn: '再入职',
      jobRelocation: '调职级',
      partTimeJob: '兼岗'
    };
    const getFormByType = formType => {
      if (formType === 'regular') return React.createElement(Regular, { getIdOfPositionInfo: this.getIdOfPositionInfo, record: record, form: form, getFieldDecorator: form.getFieldDecorator });
      if (formType === 'transfer') return React.createElement(Transfer, { form: form, getIdOfPositionInfo: this.getIdOfPositionInfo, record: record, getFieldDecorator: form.getFieldDecorator });
      if (formType === 'dimission') return React.createElement(Dimission, { getFieldDecorator: form.getFieldDecorator });
      if (formType === 'againIn') return React.createElement(AgainIn, { form: form, record: record, getIdOfPositionInfo: this.getIdOfPositionInfo, getFieldDecorator: form.getFieldDecorator });
      if (formType === 'jobRelocation') return React.createElement(JobRelocation, { form: form, record: record, getFieldDecorator: form.getFieldDecorator });
      if (formType === 'partTimeJob') {
        return addPartTimeJob ? React.createElement(PartTimeJob, { getIdOfPositionInfo: this.getIdOfPositionInfo, form: form, getFieldDecorator: form.getFieldDecorator }) : React.createElement(
          'div',
          { style: { paddingBottom: 50 } },
          React.createElement(
            Button,
            { style: { marginBottom: 10 }, type: 'primary', onClick: this.addPartTimeJob },
            '\u65B0\u589E\u517C\u5C97'
          ),
          React.createElement(
            'div',
            { className: styles.partTimeJobTable },
            React.createElement(Table, { dataSource: secondPosition, size: 'middle', pagination: false, columns: columnsJob })
          )
        );
      }
    };

    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          null,
          React.createElement(WTitle, {
            onClearAll: this.onClearAll,
            searchText: searchText,
            selectValue: selectValue,
            dispatch: dispatch,
            updatePropsToState: this.updatePropsToState,
            listTotal: newData.totalCount || 0,
            onSearchChange: this.onSearchChange
          })
        )
      ),
      React.createElement(
        'div',
        { className: styles.tableArea },
        React.createElement(Table, { loading: loading, onChange: this.handleChange, dataSource: newData.list || [], pagination: false, columns: columns })
      ),
      React.createElement(HRPagination, { currentPage: currentPage, pageSize: pageSize, listTotal: newData.totalCount, onChange: (page, size) => {
          this.paginationChange(page, size);
        } }),
      React.createElement(
        Modal,
        {
          visible: visible,
          title: modalTitle[modalType],
          onOk: this.submitForm.bind(this),
          width: 1200,
          onCancel: this.handleCancel,
          footer: !addPartTimeJob && modalType === 'partTimeJob' ? null : [React.createElement(
            Button,
            { className: styles.submitModal, key: 'submit', type: 'primary', onClick: this.submitForm.bind(this) },
            '\u63D0\u4EA4'
          ), React.createElement(
            Button,
            { className: styles.submitModal, style: { marginLeft: 15 }, key: 'back', onClick: this.handleCancel },
            '\u5173\u95ED'
          )]
        },
        record ? React.createElement(
          Row,
          { className: styles.userInfoTitle, type: 'flex', justify: 'space-between' },
          React.createElement(
            Col,
            { span: 3, className: styles.userName },
            record.employeeName
          ),
          React.createElement(
            Col,
            { span: 7 },
            '\u804C\u4E1A\u751F\u6DAF\uFF1A ',
            record.careerName
          ),
          React.createElement(
            Col,
            { span: 7 },
            '\u804C\u7EA7\uFF1A ',
            record.jobLevelName
          ),
          React.createElement(
            Col,
            { span: 7 },
            modalType === 'againIn' ? `离职日期：${moment(leaveDate).format(dateFormat)}` : `入职日期：${moment(record.entryDate).format(dateFormat)}`,
            ' '
          ),
          React.createElement(
            Col,
            { offset: 3, span: 7 },
            '\u90E8\u95E8\uFF1A',
            record.deptName
          ),
          React.createElement(
            Col,
            { span: 7 },
            '\u5C97\u4F4D\uFF1A',
            record.positionName
          ),
          React.createElement(Col, { span: 7 })
        ) : null,
        React.createElement(
          'div',
          { className: styles.modalForm },
          React.createElement(
            Form,
            null,
            modalType && getFormByType(modalType)
          )
        )
      )
    );
  }
}) || _class);


export default Form.create()(WList);