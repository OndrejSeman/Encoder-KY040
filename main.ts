const enum direction {
    //% block="↩️"
    clockwise = 2,
    //% block="↪️"
    counterclockwise = 4
}

//% weight=100 color=#0000bb icon="\uf1ce" blockId="KY-040"
namespace KY040 {


    let CLKPin = DigitalPin.P0;
    let DTPin = DigitalPin.P1;
    let EvCounter = 1
    const KYEventID = 3100;
    let lastPressed = 1;
    let pressedID = 5600;

    let Richtung = 1
    let CLKAKTUELL = 0
    let CLKLETZTE = 0

    //% blockId=SetKy weight=100
    //% block="setKYPins CLK %CPin DT %DPin"
    //% block.loc.de="KY-040 Pins an CLK %CPin DT %DPin"
    //% CPin.defl=DigitalPin.C16  DPin.defl=DigitalPin.C17
    //% CPin.fieldEditor="gridpicker" DPin.fieldEditor="gridpicker"
    //% CPin.fieldOptions.columns=5 DPpin.fieldOptions.columns=5
    export function setKY040(CPin: DigitalPin, DPin: DigitalPin): void {
        CLKPin = CPin;
        DTPin = DPin;
        pins.setPull(CLKPin, PinPullMode.PullUp)
        pins.setPull(DTPin, PinPullMode.PullUp)
        pins.onPulsed(CLKPin, PulseValue.High, function () {
            RotaryEncoder()
        })
        pins.onPulsed(CLKPin, PulseValue.Low, function () {
            RotaryEncoder()
        })
    }

    //% pin.fieldEditor="gridpicker" weight=90
    //% pin.fieldOptions.columns=2
    //% blockId=onTurned block="on turned in direction %direction"
    //% block.loc.de="wenn in Richtung %direction gedreht"
    export function onTurned(Richtung: direction, handler: () => void) {
        control.onEvent(KYEventID + Richtung, 0, handler);
    }

    //% blockId=onPressEvent block="on KY040 at %pin|pressed"
    //% block.loc.de="wenn KY040 an %pin|gedrückt"
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=5 
    export function onPressEvent(pin: DigitalPin, handler: () => void) {
        pins.setPull(pin, PinPullMode.PullUp)
        control.onEvent(pressedID, 0, handler);
        control.inBackground(() => {
            while (true) {
                const pressed = pins.digitalReadPin(pin);
                if (pressed != lastPressed) {
                    lastPressed = pressed;
                    // serial.writeLine("P")
                    if (pressed == 0) control.raiseEvent(pressedID, 0);
                }
                basic.pause(50);
            }
        })
    }


    function RotaryEncoder() {
        CLKAKTUELL = pins.digitalReadPin(CLKPin)
        // serial.writeLine("Rotary-Event")        
        if (CLKAKTUELL != CLKLETZTE) {
            let DTValue = pins.digitalReadPin(DTPin)
            if (DTValue != CLKAKTUELL) {
                Richtung = 1
            } else {
                Richtung = 0
            }
            EvCounter += 1
            // serial.writeValue("CLK",CLKAKTUELL)
            // serial.writeValue("DT", DTValue)
            if (EvCounter % 2 == 0) { // kill every second Event            
                if (Richtung == 1) {
                    // serial.writeLine("counterclockwise")
                    control.raiseEvent(KYEventID + direction.clockwise, direction.clockwise);
                } else {
                    // serial.writeLine("clockwise")
                    control.raiseEvent(KYEventID + direction.counterclockwise, direction.counterclockwise);
                }
            }
            CLKLETZTE = CLKAKTUELL
        }
    }
}