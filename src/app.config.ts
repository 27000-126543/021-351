export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/inspect/index',
    'pages/report/index',
    'pages/mine/index',
    'pages/project-detail/index',
    'pages/issue-record/index',
    'pages/report-detail/index',
    'pages/signature/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '工资专户核验',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/inspect/index',
        text: '抽查',
      },
      {
        pagePath: 'pages/report/index',
        text: '纪要',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});
