# Theoretical explanation of how to measure the speed of light in one way

## Problem

Problem of measuring speed of light in one direction is describe in:

- [en.wikipedia.org/wiki/One-way_speed_of_light](https://en.wikipedia.org/wiki/One-way_speed_of_light)
- [YT: Veritasium: "Why The Speed Of Light* Can't Be Measured"](https://www.youtube.com/watch?v=pTn6Ewhb27k)

**In short:**  
Main trouble of on way measuring is synchronization two clocks/timers.  
Source timer and detector timer cannot be started at exactly same time.

## Solution 

### At first

This solution is only based on theoretical model and [web application simulation](http://bfbxrcu.cluster028.hosting.ovh.net/light-speed-calc/).  
It was not done in real environment, using real, existing devices.  

### Theoretical explanation

Idea to solve this problem is based on continuous broadcasting light flashes.  
In this approach speed of light is not calculated by one measurment but by series of measurments.

Measurement must be divided into 3 steps:

1. Synchronization
2. Separation
3. Measure

#### 1. Synchronization

In this step Emitter (as source of light) and Gauge (detector of light) are connected.  
In other words: distance between them is equal 0.  

It can be assumed that light is released from Emitter and received by Gauge is the same moment of time.

Emitter is resposible for sending light as signal with two states: ON / OFF.  
Time duration of light ON and time duration of light OFF is permanent.  
Both times are set in Emitter and can be set in Gauge.  

During synchronization Emitter is sending light signals and Gauge is adapting to them.  
By this process Emitter "metronome" and Gauge "metronome" are being synchronized.

Delay between releasing light and receiving should be equal 0.

![Synchronization illustraion](Synchronization.png)

#### 2. Separation

After synchronization, Gauge can be disconnected from Emitter.  
In this step Gauge is moving in one direction to target position - away from Emitter.  
Movement can be done slowly or fast - theoretical it doesn't matter for result.

During this porcess Emitter is constantly sending light signals (ON/OFF) - according to Emitter "metronome".

Gauge "metronome" is permanently running and Gauge known when light signal (ON/OFF) was released and known when light signal (ON/OFF) was received.

Difference between time send and time received is named as delay.

Delay is increasing because distance is increasing.
After reaching target position, delay is constant.

![Separation illustraion](Separation.png)

#### 3. Measure

After separation, Gauge can start measuring speed of light.

Emitter is still constantly sending light signals (ON/OFF) - according to Emitter "metronome".  
Gauge is still receiving signals ON/OFF but with constant delay.

Now using this two values distance and delay - speed of light can be calculated. 

![Measure illustraion](Measure.png)

## Additional informations

### Author

Mateusz Skafiriak  
[LinkedIn](https://www.linkedin.com/in/mateusz-skafiriak)  
[GitHub](https://github.com/N0N4M3pl/light-speed-calc)

### Timeline

2022-02-06 - Document and web-applicaation are released in public    
2022-02-05 - Document added: "Theoretical explanation of how to measure the speed of light in one way"  
2022-02-04 - Web aplication : finished  
2022-01-11 - Web aplication: git init and first commit  
2022-01-09 - Watched Veritasium video "Why The Speed Of Light* Can't Be Measured"  

### Licence

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.