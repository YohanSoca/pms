from pyModbusTCP.client import ModbusClient
import time

c = ModbusClient()
c.host("10.0.0.10")
c.port(502)
c.unit_id(1)
# managing TCP sessions with call to c.open()/c.close()
c.open()

c.write_single_coil(713, 0)

while True:
    for reg in range(713, 714):
        time.sleep(2)
        try:
            val = c.read_discrete_inputs(reg, 1)[0]
            if val != 0:
                print(f"Register: {reg}, Value: {val}")
        except:
            pass    
