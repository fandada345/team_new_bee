# 当前功能说明

这个项目目前是一个个人消费分析后端 POC，项目名是 **Spend Insight AI**。它可以接收交易 CSV，完成数据校验、清洗、分类、统计分析，并输出结构化 JSON 洞察。

## 现在已经有的功能

### 1. FastAPI 后端服务

- 应用入口：`app/main.py`
- 健康检查接口：`GET /health`
- CSV 分析接口：`POST /analyze`
- 自动接口文档：启动后访问 `http://127.0.0.1:8000/docs`

`POST /analyze` 支持上传 `.csv` 文件，并返回完整分析结果。

### 2. CSV 文件读取

- API 上传入口会读取用户上传的 CSV。
- CLI 脚本也可以直接读取本地 CSV。
- 当前要求上传文件扩展名必须是 `.csv`。

示例数据：

- `data/showcase_transactions.csv`
- `data/sample_transactions.csv`
- `data/invalid_transactions.csv`
- `data/sample_response.json`

### 3. 数据校验

校验逻辑在 `app/services/validator.py`。

目前会检查：

- CSV 是否为空
- 是否包含必需字段：`date`、`category`、`amount`
- 日期是否能被解析
- 金额是否能被解析为数字
- 校验错误会返回行号提示，方便定位问题

校验失败时，API 会返回 `400` 和结构化错误信息。

### 4. 数据清洗

清洗逻辑在 `app/services/cleaner.py`。

目前会做：

- 字段名统一转成小写
- 如果没有 `merchant` 字段，会补成 `Unknown Merchant`
- 日期转成 datetime
- 金额转成数字
- 分类文本做首字母大写和空格清理
- 商户名做空值处理和文本标准化
- 删除日期或金额无效的行
- 金额统一取绝对值，当作支出处理
- 删除重复交易
- 按日期排序

### 5. 固定消费分类映射

分类映射逻辑在 `app/services/category_mapper.py`。

当前固定分类包括：

- Groceries
- Dining
- Transport
- Rent
- Utilities
- Subscriptions
- Shopping
- Other

系统会用字典规则把原始分类映射到固定分类；无法识别的分类会进入 `Other`。

### 6. 消费统计分析

分析逻辑在 `app/services/analytics.py`。

目前输出：

- 总交易数
- 总支出
- 平均单笔支出
- 数据日期范围
- 按分类汇总的支出金额、交易数、占比
- 周趋势
- 月趋势
- Top 商户
- 最大几笔交易
- 异常大额交易

异常检测目前是可解释的规则方案，综合使用：

- IQR 阈值
- 类 z-score 阈值
- 平均金额倍数

### 7. 规则型洞察生成

洞察逻辑在 `app/services/insight_engine.py`。

目前能生成最多 5 条洞察，包括：

- 最高消费分类
- 最近一周消费是否明显升高
- 高频商户提醒
- 订阅支出占比提醒
- 异常大额交易提醒
- 数据基线提醒

每条洞察包含：

- `title`
- `evidence`
- `recommendation`
- `severity`

### 8. 统一分析流水线

核心编排在 `app/services/pipeline.py`。

当前流水线是：

```text
Request Handler -> Validation -> Data Processing -> Analytics -> Insight Generator -> Output
```

API 和 CLI 复用同一套流水线，所以两边的分析结果是一致的。

### 9. CLI 本地分析脚本

脚本入口：`scripts/run_analysis.py`

可以不用启动 API，直接分析本地 CSV：

```bash
python scripts/run_analysis.py data/showcase_transactions.csv --output data/output.json
```

脚本会把分析结果写成 JSON 文件。

### 10. Pydantic 响应模型

响应结构定义在 `app/models/schemas.py`。

当前主要响应模型包括：

- `AnalyzeResponse`
- `SummaryMetrics`
- `CategoryBreakdownItem`
- `TrendPoint`
- `MerchantStats`
- `TransactionRecord`
- `AnomalyRecord`
- `InsightItem`
- `ErrorResponse`

这让 API 返回结构比较稳定，后面接前端会容易一些。

### 11. 单元测试

当前已有 pytest 测试：

- `tests/test_validator.py`
- `tests/test_cleaner.py`
- `tests/test_analytics.py`
- `tests/test_insight_engine.py`

覆盖了校验、清洗、分析和洞察生成的核心逻辑。

## 现在还没有的功能

这些功能目前还没有实现：

- 用户登录或账户系统
- 数据库持久化
- 上传历史记录
- 多用户隔离
- 真正的机器学习模型
- 银行 API 或第三方支付平台连接
- 导出 PDF 或 Excel 报告
- 预算设置和长期追踪
- 自动部署配置

## 怎么运行

安装依赖：

```bash
pip install -r requirements.txt
```

启动 API：

```bash
uvicorn app.main:app --reload
```

运行测试：

```bash
pytest
```

运行 CLI：

```bash
python scripts/run_analysis.py data/showcase_transactions.csv --output data/output.json
```

## 当前项目状态总结

目前你已经完成了一个可运行的消费分析 POC。它的核心能力是：上传或读取交易 CSV，然后返回一份包含统计结果、异常提醒和规则洞察的 JSON 报告，并由 React 仪表盘展示这些结果。

下一步最自然的方向是二选一：

- 在 SageMaker 里运行实验脚本，并用 ClearML 记录实验指标。
- 继续加强后端，比如增加预算规则、月度对比、导出报告或数据库保存历史结果。
