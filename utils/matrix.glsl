/* 二维旋转矩阵 */
mat2 rotate(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}
/* 二维缩放矩阵 */
mat2 scale(vec2 scale) {
    return mat2(scale.x, 0., 0., scale.y);
}