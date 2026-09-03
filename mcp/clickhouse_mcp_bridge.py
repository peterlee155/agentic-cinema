# ClickHouse MCP Bridge Client
import sys, os, logging
from typing import Dict, Any, List, Optional

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from mcp.clickhouse_mcp_server import clickhouse_mcp, ClickHouseMCPServer
from db.clickhouse_client import db

logger = logging.getLogger('ClickHouseMCPBridge')
logging.basicConfig(level=logging.INFO)

class ClickHouseMCPBridge:
    def __init__(self, mcp_server: Optional[ClickHouseMCPServer] = None):
        self.server = mcp_server or clickhouse_mcp
        self.server_info = getattr(self.server, 'server_info', {
            'name': 'clickhouse-cinema-mcp',
            'version': '1.2.0',
            'protocol_version': '2024-11-05'
        })
        self.server_name = self.server_info.get('name', 'clickhouse-cinema-mcp')
        self.server_version = self.server_info.get('version', '1.2.0')
        self.protocol_version = self.server_info.get('protocol_version', '2024-11-05')

    def is_healthy(self) -> bool:
        try:
            return len(self.server.list_tools()) >= 4
        except Exception:
            return False

    def list_available_tools(self) -> List[Dict[str, Any]]:
        return self.server.list_tools()

    def call_tool(self, tool_name: str, arguments: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        args = arguments or {}
        try:
            res = self.server.execute_tool(tool_name, args)
            return {'success': True, 'tool': tool_name, 'result': res, 'protocol': self.protocol_version}
        except Exception as e:
            return {'success': False, 'tool': tool_name, 'error': str(e)}

    def execute_analytical_sql(self, query: str) -> Dict[str, Any]:
        call = self.call_tool('run_clickhouse_query', {'query': query})
        return call.get('result', {})

    def get_agent_telemetry(self, project_id: str = 'proj_last_spell') -> Dict[str, Any]:
        call = self.call_tool('get_production_telemetry', {'project_id': project_id})
        return call.get('result', {})

    def get_character_dialogue_analytics(self, project_id: str = 'proj_last_spell') -> Dict[str, Any]:
        call = self.call_tool('get_character_analytics', {'project_id': project_id})
        return call.get('result', {})

    def get_scene_vfx_metrics(self, project_id: str = 'proj_last_spell') -> Dict[str, Any]:
        call = self.call_tool('get_scene_metrics', {'project_id': project_id})
        return call.get('result', {})

    def print_diagnostics_report(self):
        print("======================================================================")
        print('  CLICKHOUSE MODEL CONTEXT PROTOCOL (MCP) BRIDGE DIAGNOSTICS')
        print('======================================================================')
        print('  Server Name:       ' + self.server_name)
        print('  Server Version:    v' + self.server_version)
        print('  MCP Protocol:      ' + self.protocol_version)
        print('  Target Database:   ' + str(self.server.db.database))
        print('  Health Status:     ' + ('ONLINE AND READY' if self.is_healthy() else 'INITIALIZING'))
        print('----------------------------------------------------------------------')
        tools = self.list_available_tools()
        print('  Available MCP Tools (' + str(len(tools)) + '):')
        for idx, t in enumerate(tools, 1):
            print('    ' + str(idx) + '. ' + t['name'] + ' - ' + t['description'])
        print('----------------------------------------------------------------------')
        print('  Testing MCP Execution (run_clickhouse_query)...')
        sample = 'SELECT agent_name, count(), avg(latency_ms) FROM production_telemetry GROUP BY agent_name'
        res = self.execute_analytical_sql(sample)
        print('  Source:        ' + str(res.get('source', 'unknown')))
        print('  Rows Returned: ' + str(res.get('row_count', 0)))
        cols = res.get('column_names', [])
        if cols:
            print('  Columns:       ' + ', '.join(cols))
        rows = res.get('result_rows', [])[:4]
        for r in rows:
            print('    -> ' + str(r))
        print("======================================================================")

clickhouse_bridge = ClickHouseMCPBridge()

if __name__ == '__main__':
    clickhouse_bridge.print_diagnostics_report()
