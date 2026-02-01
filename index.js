// File: FFShizukuService.java
package com.oxyx.ffservice;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.os.RemoteException;
import rikka.shizuku.Shizuku;
import rikka.shizuku.ShizukuProvider;

public class FFShizukuService extends Service {
    
    private final Shizuku.UserServiceArgs serviceArgs = 
        new Shizuku.UserServiceArgs(new ComponentName(this, FFShizukuService.class))
            .processName("com.dts.freefireth")
            .debuggable(true)
            .version(1);

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Request Shizuku permission
        if (Shizuku.checkSelfPermission() != PackageManager.PERMISSION_GRANTED) {
            Shizuku.requestPermission(0);
        }
        
        // Bind service ke game
        Shizuku.bindUserService(serviceArgs, new IFFShizukuService.Stub() {
            @Override
            public void setAimMode(int mode) throws RemoteException {
                // Mode: 0=head, 1=body
                applyAimLock(mode);
            }
            
            @Override
            public void setSensitivity(float sens) throws RemoteException {
                modifyGameMemory("sensitivity", sens);
            }
            
            @Override
            public void toggleAimbot(boolean enable) throws RemoteException {
                enableAimbot(enable);
            }
        });
    }
    
    private void applyAimLock(int mode) {
        try {
            // Inject ke memory game Free Fire
            Process process = Runtime.getRuntime().exec("su");
            DataOutputStream os = new DataOutputStream(process.getOutputStream());
            
            String pid = getGamePID("com.dts.freefireth");
            
            // Memory addresses untuk aim (contoh)
            String aimAddress = (mode == 0) ? "0x12345678" : "0x87654321";
            
            os.writeBytes("echo " + aimAddress + " > /proc/" + pid + "/mem\n");
            os.writeBytes("exit\n");
            os.flush();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private String getGamePID(String packageName) {
        // Dapatkan PID game
        try {
            Process process = Runtime.getRuntime().exec("pidof " + packageName);
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            return reader.readLine().trim();
        } catch (Exception e) {
            return "unknown";
        }
    }
}