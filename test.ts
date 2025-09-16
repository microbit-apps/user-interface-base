import Screen = user_interface_base.Screen

let i = 0;
while (1) {
  Screen.fillRect(0, 0, 160, 128, i % 15);
  basic.pause(1000);
  i++
}
