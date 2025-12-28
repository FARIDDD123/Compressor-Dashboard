# OPC-UA Client Setup Guide

این راهنما نحوه پیکربندی و استفاده از OPC-UA Client را شرح می‌دهد.

## 📋 پیش‌نیازها

- OPC-UA Server (SCADA/PLC system)
- Python OPC-UA libraries (asyncua, opcua)

## 🔧 پیکربندی Environment Variables

در فایل `.env` اضافه کنید:

```env
# OPC-UA Server Configuration
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=opcua_user
OPCUA_PASSWORD=opcua_password

# Node IDs (configure based on your OPC-UA server structure)
OPCUA_NODE_LOAD_FACTOR=ns=2;s=LoadFactor
OPCUA_NODE_PRESSURE_SETPOINT=ns=2;s=PressureSetpoint
OPCUA_NODE_TEMPERATURE_SETPOINT=ns=2;s=TemperatureSetpoint
OPCUA_NODE_SYSTEM_STATUS=ns=2;s=SystemStatus
```

## 🔐 Security Configuration (NF-414)

طبق requirement NF-414، OPC-UA connection باید از:
- **Unique credentials** برای RTO control استفاده کند
- **Restricted permissions** داشته باشد
- **Isolated** از سایر connections باشد

برای این منظور:
1. یک کاربر OPC-UA جداگانه برای RTO ایجاد کنید
2. فقط read/write permissions برای control nodes بدهید
3. این credentials را در `.env` نگه دارید (نه در کد)

## 🚀 استفاده

### 1. Propose Control Change

```python
POST /api/control/settings
Authorization: Bearer <token>

{
    "parameter": "load_factor",
    "current_value": 0.75,
    "proposed_value": 0.85,
    "reason": "Optimization based on RTO analysis"
}
```

### 2. Approve Action (Engineer Only)

```python
POST /api/control/actions/{action_id}/approve
Authorization: Bearer <engineer_token>
```

### 3. Execute Action

```python
POST /api/control/actions/{action_id}/execute
Authorization: Bearer <engineer_token>
```

## 🔄 Closed-Loop Control Workflow (FR-343)

1. **RTO Suggestion** → RTO module پیشنهاد بهینه‌سازی می‌دهد
2. **Propose Action** → سیستم یک control action پیشنهاد می‌کند
3. **Engineer Approval** → مهندس action را بررسی و approve می‌کند
4. **Execute** → Action از طریق OPC-UA اجرا می‌شود
5. **Monitor** → نتایج monitor می‌شوند

## 📝 Integration with RTO

برای integrate کردن RTO با OPC-UA:

```python
from backend.opcua.opcua_client import OPCUAClient, OPCUAControlExecutor

# در RTO consumer، بعد از تولید suggestion:
executor = OPCUAControlExecutor(OPCUAClient())
action = await executor.propose_control_action(
    action_id=generate_uuid(),
    parameter="load_factor",
    current_value=current_load,
    proposed_value=suggested_load,
    reason="RTO optimization suggestion"
)
```

## ⚠️ نکات امنیتی

1. **Credentials:**
   - هرگز credentials را در کد hard-code نکنید
   - از environment variables یا secret management استفاده کنید

2. **Network Security:**
   - OPC-UA connection باید در یک network isolated باشد
   - از VPN یا firewall rules استفاده کنید

3. **Access Control:**
   - فقط engineers و admins می‌توانند actions را approve/execute کنند
   - تمام actions log می‌شوند

## 🧪 Testing

برای تست OPC-UA connection:

```python
from backend.opcua.opcua_client import OPCUAClient

client = OPCUAClient()
connected = await client.connect()
if connected:
    params = await client.read_control_parameters()
    print(f"Connected! Parameters: {params}")
```

## 🐛 Troubleshooting

### مشکل: "Cannot connect to OPC-UA server"
- بررسی کنید که OPC-UA server در حال اجرا است
- Endpoint URL را بررسی کنید
- Firewall rules را بررسی کنید

### مشکل: "Authentication failed"
- Username/password را بررسی کنید
- اطمینان حاصل کنید که کاربر در OPC-UA server وجود دارد

### مشکل: "Node not found"
- Node IDs را بررسی کنید
- ساختار OPC-UA server را با brows کردن بررسی کنید

