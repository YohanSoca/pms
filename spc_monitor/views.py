from django.shortcuts import render
from .spc import SPC
import pandas
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from pyModbusTCP.client import ModbusClient
import time
import threading

class PMS:
    def __init__(self):
        self.pms_link = None
        self.connected = False
        self.pms_table = {
            'status': [
                {'port_auto': 712},
                {'stbd_auto': 713},
                {'port_gen_power': 381},
                {'stbd_gen_power': 382},
                {'port_current': 383},
                {'stbd_current': 400},
                {'port_volts': 402},
                {'stbd_volts': 403},
                {'shore_power': 405},
                {'total_power': 411},
                {'count_down_port': 487},
                {'count_down_stbd': 489},
                {'cooldown_port': 651},
                {'cooldown_stbd': 652},
                {'port_frec': 727},
                {'stbd_frec': 728},
                {'start_gen': 410},
                {'stop_gen': 412},
                {'busbar_volts': 726},
                {'port_cos': 985},
                {'stbd_cos': 986}
            ],
            'cmds': [
                {'port_auto': 712},
                {'stbd_auto': 713},
                {'horn_quiet': 765},
                {'reset_transfer': 767},
                {'close_port': 770},
                {'close_stbd': 771},
                {'open_port': 772},
                {'open_stbd': 773},
                {'start_port': 1001},
                {'start_stbd': 769},
                {'start_stbd': 1002},
                {'ack': 1003},
                {'reset_start_gen_alarm': 774},
                {'reset_transfer': 767},
                {'horn_quiet': 765}
        ]}
        self.thruster_auto_pattern = [
            'ack', 'reset_start_gen_alarm', 'reset_transfer', 'start_port', 'start_stbd', 'port_auto', 'stbd_auto'
            ]
        self.pms_status = []
        self.requested_cmds = []
        self.new_cmds = False
        self.thruster_auto = False
        self.thruster_on = False
        threading.Thread(target=self.thrusterWatcher).start()
        
    def thrusterWatcher(self):
        while True:
            time.sleep(1)
            # try:
            #     wago_plc = ModbusClient()
            #     wago_plc.host('10.0.0.10')
            #     wago_plc.port(502)
            #     wago_plc.unit_id(1)
            #     wago_plc.open()
                
            #     thruster_status = wago_plc.read_holding_registers(1, 1)
            #     if thruster_status:
            #         self.thruster_on = True
            #     else:
            #         self.thruster_status = False    
                
            # except: 
            #     pass   
            # If thruster is on check if mode is in auto 
            if self.thruster_auto:#self.thruster_on and self.thruster_auto:
                for cmd in self.thruster_auto_pattern:
                    self.execute_cmd(cmd)
                    time.sleep(3)
                   
        
    def setThrusterAutoManual(self, mode):
        if mode == 'on':
            self.thruster_auto = True
            return
        if mode == 'off':
            self.thruster_auto = False
            return
        
    def execute_cmd(self):
        if self.connected:
            for cmd_in_table in self.pms_table['cmds']:
               for key, address in cmd_in_table.items():
                  if key == cmd:
                      try:
                        print(f"Found cmd, address: {address}")
                        self.pms_link.write_single_coil(address)
                        return True
                      except:
                        return False 
    
    def add_cmd(self, cmd):
        self.requested_cmds.append({'cmd': cmd, 'done': False})
        print(f"New cmd received, {cmd}")
        self.new_cmds = True    
        
    def connect(self):
        try:
            self.pms_link = ModbusClient()
            self.pms_link.host('10.0.0.10')
            self.pms_link.port(502)
            self.pms_link.unit_id(1)
            self.pms_link.open()
            
            self.connected = True
            print('connected')
        except:
            print('Cant connect to plc')    
            
    def get_status(self):
        if self.connected:
            self.pms_status.append({'thruster_auto': self.thruster_auto}) 
            for status in self.pms_table['status']:
               for key, address in status.items():
                  try:
                      value = self.pms_link.read_holding_registers(address)
                      if value:
                          self.pms_status.append({key: value})
                      else:
                          self.pms_status.append({key: 3700})    
                  except:
                      value = '0'
                      self.pms_status.append({key: value})   
    
    def execute_cmd(self, new_cmd):
        print(F"Executing command: {new_cmd}")
        if self.connected:
            for cmd in self.pms_table['cmds']:
               
               for key, address in cmd.items():
                  if key == new_cmd:
                      try:
                        self.pms_link.write_single_coil(address, 1)
                        print(key)
                      except:
                        return False 
    
                
                    
# Create a PMS              
pms = PMS()
pms.connect()

     
          

def index(request):    
    return render(request, 'pages/index.html')

def controller(request):
    return render(request, 'pages/controller.html')    

@csrf_exempt
def get_status(request):
    global pms
    status = {}
 
    if pms.connected:
        pms.get_status()
        for state in pms.pms_status:
            for key, value in state.items():
                status[key] = value  
        

        return JsonResponse({'pms': status, 'connected': True})
    else:
        return JsonResponse({'pms': status, 'connected': False})
        

@csrf_exempt
def auto_manual(request):
    
    if request.method == 'POST':
        data = json.loads(request.body)
        gen = data['gen']
        mode = data['mode']
        
        if gen == 'port':
            if mode == 'auto':
                c.write_single_coil(712, 1)
                return JsonResponse({'request': 'succes'})
            if mode == 'manual':
                c.write_single_coil(712, 0)
                return JsonResponse({'request': 'succes'})
        if gen == 'stbd':
            if mode == 'auto':
                c.write_single_coil(713, 1)
                return JsonResponse({'request': 'succes'})
            if mode == 'manual':
                c.write_single_coil(713, 0)
                return JsonResponse({'request': 'succes'})    
        
@csrf_exempt
def add_cmd(request):
    global pms
        
    if request.method == 'POST':
        data = json.loads(request.body)
        cmd = data['cmd']
        pms.add_cmd(cmd)
        pms.execute_cmd(cmd)
        
        return JsonResponse({'status': 'ok'})
        
@csrf_exempt
def thruster_auto_manual(request):
    global pms
    
    if request.method == 'POST':
        data = json.loads(request.body)
        mode = data['truster_auto']
        
        if mode == 'on':
            print(f"Mode: {mode}")
            pms.setThrusterAutoManual(mode)
            return JsonResponse({'request': 'succes'})
        if mode == 'off':
            print(f"Mode: {mode}")
            pms.setThrusterAutoManual(mode)
            return JsonResponse({'request': 'succes'})    
    
        
          
    