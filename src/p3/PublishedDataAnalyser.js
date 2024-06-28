import P3vmEvents from "./P3EventEnum";

export default class PublishedDataAnalyser {
    static _instance;
    publisher = null; // Function to publish events

    // Get instance
    static getInstance() {
        if (!PublishedDataAnalyser._instance) {
            PublishedDataAnalyser._instance = new PublishedDataAnalyser();
        }
        return PublishedDataAnalyser._instance;
    }

    analyse(data, p3vm) {
        this.publisher = p3vm.publish.bind(p3vm);
        this.detectButtonClick(data);
        this.detectRotation(data);
        this.detectTilt(data);
        this.detectMovement(data);
    }

    detectTilt(data) {
        TiltDetection.detectTilt(data.LSM6DS.ax, data.LSM6DS.ay, data.LSM6DS.az, {
            onTiltLeft: () => this.publisher(P3vmEvents.TILE_LEFT),
            onTiltRight: () => this.publisher(P3vmEvents.TILT_RIGHT),
            onTiltForward: () => this.publisher(P3vmEvents.TILT_FORWARD),
            onTiltBackward: () => this.publisher(P3vmEvents.TILT_BACKWARD),
        })
    }

    detectMovement(data) {
        return ShakeDetector.detectShake(data.LSM6DS.ax, data.LSM6DS.ay, data.LSM6DS.az, () => this.publisher(P3vmEvents.ON_SHAKE), () => this.publisher(P3vmEvents.ON_MOVE));
    }

    detectRotation(data) {
        RotationDetection.detectRotation(data.LSM6DS.gx, data.LSM6DS.gy, data.LSM6DS.gz, () => this.publisher(P3vmEvents.ON_ROTATE_CLOCKWISE), () => this.publisher(P3vmEvents.ON_ROTATE_COUNTER_CLOCKWISE));
    }

    detectButtonClick(data) {
        ButtonClickDetection.detectButtonClick(data.Light.irVals[2], () => this.publisher(P3vmEvents.ON_BUTTON_CLICK));
    }
}

class TiltDetection {
    /* Detecting tilt events using accelerometer data */
    static tilted = false
    static detectTilt(xAcc, yAcc, zAcc, { onTiltLeft, onTiltRight, onTiltForward, onTiltBackward }) {

        let tiltDirection = "";
        //console.log(this.tilted)
        if (this.tilted == false){
            if (yAcc < -0.5) {
                tiltDirection = "forward";
                onTiltForward();
                this.tilted = true;
            }
            else if (yAcc > 0.5) {
                tiltDirection = "backward";
                onTiltBackward();
                this.tilted = true;
            }
            else if (xAcc < -0.5) {
                tiltDirection = "left";
                onTiltLeft();
                this.tilted = true;
            }
            else if (xAcc > 0.5) {
                tiltDirection = "right";
                onTiltRight();
                this.tilted = true;
            }

        }
        else if(xAcc < 0.3 && xAcc > -0.3 && yAcc > -0.3 && yAcc < 0.3 && this.tilted == true){
            //console.log("falsifying")
            this.tilted = false;
        }
        if (tiltDirection !== "") {
            //console.log("Tilt direction: ", tiltDirection);
            //console.log("pitch: ", pitch, "roll: ", roll, "yaw: ", yaw);
        }
    }
}

class RotationDetection {
    /* Detecting rotation events using gyroscope data */
    static Zmagnitude = 0;
    static detectRotation(xGyro, yGyro, zGyro, onClockRotationDetected, onCounterClockRotationDetected) {
        this.Xmagnitude = Math.abs(xGyro)
        this.Ymagnitude = Math.abs(yGyro)
        this.Zmagnitude = Math.abs(zGyro)
        if (this.Xmagnitude < 80 && this.Ymagnitude < 80 && this.Zmagnitude > 80){

            if (zGyro > 0){
                onClockRotationDetected();
                //console.log("Rotating clockwise.")
            }else{
                onCounterClockRotationDetected();
                //console.log("Rotating anti-clockwise.")
            }
        }
    }

}

class ShakeDetector {
    /* Detecting shake and move events using accelerometer data */
    static detectShake(xAcc, yAcc, zAcc, onShakeDetected, onMoveDetected) {
        console.log(xAcc + ", " + yAcc + ", " + zAcc)
    }
}

class ButtonClickDetection {
    /* Determing if Cog's button is clicked using the IR sensor value */
    static pressed = false;
    static detectButtonClick(buttonValue, onButtonClicked) {
        if (buttonValue > 100 && this.pressed == false){
            onButtonClicked();
            this.pressed = true;
            //console.log("Button was pressed")
        }else if (buttonValue < 100) {
            this.pressed = false;
            //console.log("Button is un-pressed")
        }
    }

}