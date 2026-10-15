const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backBtn = document.getElementById('backBtn');
const mapBtn = document.getElementById('mapBtn');

const NAMES = [
    "María", "Carlos", "Sofía", "Alejandro", 
    "Valentina", "Mateo", "Camila", "Lucas", 
    "Isabella", "Gabriel", "Lucía", "Diego"
];

let width, height;
let centerBox = { x: 0, y: 0, width: 300, height: 300 };
let lines = [];
let hoveredLineIndex = -1;
let hoveredBranchOptionIndex = -1;
let activeBranchOptions = [];

// Control de cámara y animación
let activeLineIndex = -1;
let camera = { x: 0, y: 0 };
let targetCamera = { x: 0, y: 0 };
let zoom = 1;
let targetZoom = 1;
let isMapView = false;
let animProgress = 0; // 0 = centro, 0.6 = llega al texto, 1.0 = texto escrito
let targetAnimProgress = 0;

function getNameWidth(name) {
    ctx.font = '700 90px "Great Vibes", "Pacifico", cursive';
    return ctx.measureText(name).width;
}

function getNameLayout(line) {
    ctx.font = '700 90px "Great Vibes", "Pacifico", cursive';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(line.name);
    const actualLeft = metrics.actualBoundingBoxLeft || 0;
    const joinOverlap = 0;
    const x = line.end.x + actualLeft - joinOverlap;
    const y = line.end.y;
    const actualRight = metrics.actualBoundingBoxRight || metrics.width;
    const ascent = metrics.actualBoundingBoxAscent || 45;
    const descent = metrics.actualBoundingBoxDescent || 0;

    return {
        x,
        left: x - actualLeft,
        y,
        right: x + actualRight,
        centerY: y + (descent - ascent) / 2,
        metrics
    };
}

function isNamePlacementClear(line) {
    const layout = getNameLayout(line);
    const padding = 55;
    const left = layout.left - padding;
    const right = layout.right + padding;
    const top = layout.y - (layout.metrics.actualBoundingBoxAscent || 45) - padding;
    const bottom = layout.y + (layout.metrics.actualBoundingBoxDescent || 0) + padding;

    const overlapsExistingLine = lines.some(existingLine => {
        if (existingLine === line) return false;

        for (let step = 0; step <= 100; step++) {
            const point = getBezierPoint(existingLine, step / 100);
            if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
                return true;
            }
        }
        return false;
    });

    const overlapsExistingName = lines.some(existingLine => {
        if (existingLine === line || !existingLine.nameVisible) return false;

        const existingLayout = getNameLayout(existingLine);
        const existingLeft = existingLayout.left - padding;
        const existingRight = existingLayout.right + padding;
        const existingTop = existingLayout.y -
            (existingLayout.metrics.actualBoundingBoxAscent || 45) - padding;
        const existingBottom = existingLayout.y +
            (existingLayout.metrics.actualBoundingBoxDescent || 0) + padding;

        return left <= existingRight && right >= existingLeft &&
            top <= existingBottom && bottom >= existingTop;
    });

    return !overlapsExistingLine && !overlapsExistingName;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    if (activeLineIndex >= NAMES.length || isMapView) {
        resetCamera();
    }
    hoveredBranchOptionIndex = -1;
    activeBranchOptions = [];
    
    centerBox.x = width / 2 - 150;
    centerBox.y = height / 2 - 150;
    
    initLines();
}

function getBranchOptions(line) {
    const nameLayout = getNameLayout(line);
    const candidates = [];
    const minimumLineDistance = 80;
    const minimumOptionDistance = 95;
    const angleRanges = [[-80, -35], [-25, 25], [35, 80]];
    const angles = angleRanges
        .map(([min, max]) => min + Math.random() * (max - min))
        .sort((a, b) => a - b)
        .map(degrees => degrees * Math.PI / 180);

    angles.forEach(angle => {
        for (let radius = 220; radius <= 8000; radius += 75) {
            const option = {
                x: nameLayout.right + Math.cos(angle) * radius,
                y: nameLayout.centerY + Math.sin(angle) * radius
            };
            const overlapsLine = lines.some(existingLine =>
                getDistanceToCurveRange(option, existingLine, 0, 1) < minimumLineDistance
            );
            const overlapsOption = candidates.some(existingOption =>
                Math.hypot(option.x - existingOption.x, option.y - existingOption.y) < minimumOptionDistance
            );

            if (!overlapsLine && !overlapsOption) {
                candidates.push({
                    ...option,
                    direction: { x: Math.cos(angle), y: Math.sin(angle) }
                });
                break;
            }
        }
    });

    return candidates;
}

function getAvailableBranchOptions(line) {
    if (line.branchOptions === null) {
        line.branchOptions = getBranchOptions(line).map((option, index) => ({
            ...option,
            id: index
        }));
    }

    return line.branchOptions;
}

function getMapNameAt(point) {
    return lines.findIndex(line => {
        if (!line.nameVisible) return false;

        const layout = getNameLayout(line);
        const padding = 18;
        const top = layout.y - (layout.metrics.actualBoundingBoxAscent || 45);
        const bottom = layout.y + (layout.metrics.actualBoundingBoxDescent || 0);
        return point.x >= layout.left - padding &&
            point.x <= layout.right + padding &&
            point.y >= top - padding &&
            point.y <= bottom + padding;
    });
}

function drawBranchOptions() {
    const options = activeBranchOptions;

    options.forEach((option, index) => {
        const direction = option.direction;
        const size = hoveredBranchOptionIndex === index ? 30 : 25;
        const tip = {
            x: option.x + direction.x * size,
            y: option.y + direction.y * size
        };
        const baseCenter = {
            x: option.x - direction.x * size * 0.65,
            y: option.y - direction.y * size * 0.65
        };
        const perpendicular = { x: -direction.y, y: direction.x };

        ctx.save();
        ctx.fillStyle = hoveredBranchOptionIndex === index ? '#B91520' : '#E41E2B';
        ctx.shadowColor = 'rgba(228, 30, 43, 0.35)';
        ctx.shadowBlur = hoveredBranchOptionIndex === index ? 12 : 6;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(
            baseCenter.x + perpendicular.x * size * 0.65,
            baseCenter.y + perpendicular.y * size * 0.65
        );
        ctx.lineTo(
            baseCenter.x - perpendicular.x * size * 0.65,
            baseCenter.y - perpendicular.y * size * 0.65
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });
}

function getBranchOptionAt(point) {
    return activeBranchOptions.findIndex(option =>
        Math.hypot(point.x - option.x, point.y - option.y) < 34
    );
}

function createBranchLine(parentLine, option) {
    parentLine.branchOptions = getAvailableBranchOptions(parentLine);
    parentLine.branchOptions = parentLine.branchOptions.filter(
        branchOption => branchOption.id !== option.id
    );
    const nameLayout = getNameLayout(parentLine);
    const start = {
        x: nameLayout.right - 4,
        y: nameLayout.y
    };
    const { x: directionX, y: directionY } = option.direction;
    const availableNames = NAMES.filter(name => name !== parentLine.name);
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    let end;
    let distance;

    for (distance = 1800; distance <= 50000; distance += 180) {
        const candidate = {
            end: {
                x: start.x + directionX * distance,
                y: start.y + directionY * distance
            },
            name
        };

        if (isNamePlacementClear(candidate)) {
            end = candidate.end;
            break;
        }
    }

    if (!end) {
        throw new Error(`No se encontró espacio libre para el nombre "${name}".`);
    }

    const segments = createCurvedSegments(
        start,
        end,
        { x: 1, y: 0 },
        distance
    );
    lines.push({
        start,
        p1: segments[0].p1,
        p2: segments[segments.length - 1].p2,
        end,
        segments,
        name,
        startsAtName: true,
        parentLineIndex: activeLineIndex,
        branchOptions: null
    });

    activeLineIndex = lines.length - 1;
    animProgress = 0;
    targetAnimProgress = 1;
    hoveredLineIndex = -1;
    hoveredBranchOptionIndex = -1;
    activeBranchOptions = [];
}

function createCurvedSegments(start, end, startTangent, distance) {
    const direction = normalizeVector({ x: end.x - start.x, y: end.y - start.y });
    const perpendicular = { x: -direction.y, y: direction.x };
    const bendScale = Math.min(distance * 0.28, 700);
    const firstBend = (Math.random() - 0.5) * bendScale * 2;
    const secondBend = (Math.random() - 0.5) * bendScale * 2;
    const firstAnchor = {
        x: start.x + direction.x * distance / 3 + perpendicular.x * firstBend,
        y: start.y + direction.y * distance / 3 + perpendicular.y * firstBend
    };
    const secondAnchor = {
        x: start.x + direction.x * distance * 2 / 3 + perpendicular.x * secondBend,
        y: start.y + direction.y * distance * 2 / 3 + perpendicular.y * secondBend
    };
    const anchors = [start, firstAnchor, secondAnchor, end];
    const tangents = [
        normalizeVector(startTangent),
        normalizeVector({ x: secondAnchor.x - start.x, y: secondAnchor.y - start.y }),
        normalizeVector({ x: secondAnchor.x - firstAnchor.x, y: secondAnchor.y - firstAnchor.y }),
        { x: 1, y: 0 }
    ];

    return anchors.slice(0, -1).map((anchor, index) => {
        const nextAnchor = anchors[index + 1];
        const handleLength = Math.min(
            550,
            Math.hypot(nextAnchor.x - anchor.x, nextAnchor.y - anchor.y) * 0.4
        );
        return {
            start: anchor,
            p1: {
                x: anchor.x + tangents[index].x * handleLength,
                y: anchor.y + tangents[index].y * handleLength
            },
            p2: {
                x: nextAnchor.x - tangents[index + 1].x * handleLength,
                y: nextAnchor.y - tangents[index + 1].y * handleLength
            },
            end: nextAnchor
        };
    });
}

function generateInitialLine(line) {
    const start = line.start;
    const direction = normalizeVector({
        x: line.end.x - line.start.x,
        y: line.end.y - line.start.y
    });
    let candidate;

    for (let distance = 1800; distance <= 50000; distance += 180) {
        const end = {
            x: start.x + direction.x * distance,
            y: start.y + direction.y * distance
        };
        candidate = {
            start,
            end,
            name: line.name,
            segments: createCurvedSegments(start, end, direction, distance)
        };
        if (isNamePlacementClear(candidate)) {
            line.end = end;
            line.segments = candidate.segments;
            line.p1 = candidate.segments[0].p1;
            line.p2 = candidate.segments[candidate.segments.length - 1].p2;
            line.generated = true;
            line.startsAtName = false;
            delete line.pathLengthTable;
            delete line.pathLength;
            return;
        }
    }

    throw new Error(`No se encontró espacio libre para el nombre "${line.name}".`);
}

function normalizeVector(vector) {
    const length = Math.hypot(vector.x, vector.y) || 1;
    return { x: vector.x / length, y: vector.y / length };
}

function drawLinePreview(line, isHovered) {
    ctx.save();
    ctx.beginPath();
    for (let step = 0; step <= 80; step++) {
        const point = getBezierPoint(line, step / 80);
        if (step === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.strokeStyle = '#E41E2B';
    ctx.lineWidth = isHovered ? 3 : 2;
    ctx.lineCap = 'round';
    ctx.globalAlpha = isHovered ? 0.9 : 0.6;
    ctx.stroke();
    ctx.restore();
}

function initLines() {
    lines = [];
    
    const offsets = [
        { start: { x: centerBox.x + 75, y: centerBox.y }, p1: { x: -30, y: -90 }, p2: { x: -80, y: -210 }, end: { x: -35, y: -285 } },
        { start: { x: centerBox.x + 150, y: centerBox.y }, p1: { x: 55, y: -110 }, p2: { x: -70, y: -230 }, end: { x: 15, y: -295 } },
        { start: { x: centerBox.x + 225, y: centerBox.y }, p1: { x: 70, y: -80 }, p2: { x: 20, y: -210 }, end: { x: 45, y: -280 } },

        { start: { x: centerBox.x + 300, y: centerBox.y + 75 }, p1: { x: 100, y: -35 }, p2: { x: 210, y: -95 }, end: { x: 285, y: -35 } },
        { start: { x: centerBox.x + 300, y: centerBox.y + 150 }, p1: { x: 110, y: 55 }, p2: { x: 230, y: -75 }, end: { x: 295, y: 15 } },
        { start: { x: centerBox.x + 300, y: centerBox.y + 225 }, p1: { x: 85, y: 70 }, p2: { x: 210, y: 25 }, end: { x: 280, y: 45 } },

        { start: { x: centerBox.x + 225, y: centerBox.y + 300 }, p1: { x: 35, y: 100 }, p2: { x: 95, y: 210 }, end: { x: 35, y: 285 } },
        { start: { x: centerBox.x + 150, y: centerBox.y + 300 }, p1: { x: -55, y: 110 }, p2: { x: 75, y: 230 }, end: { x: -15, y: 295 } },
        { start: { x: centerBox.x + 75, y: centerBox.y + 300 }, p1: { x: -70, y: 80 }, p2: { x: -20, y: 210 }, end: { x: -45, y: 280 } },

        { start: { x: centerBox.x, y: centerBox.y + 225 }, p1: { x: -100, y: 35 }, p2: { x: -210, y: 95 }, end: { x: -285, y: 35 } },
        { start: { x: centerBox.x, y: centerBox.y + 150 }, p1: { x: -110, y: -55 }, p2: { x: -230, y: 75 }, end: { x: -295, y: -15 } },
        { start: { x: centerBox.x, y: centerBox.y + 75 }, p1: { x: -85, y: -70 }, p2: { x: -210, y: -25 }, end: { x: -280, y: -45 } }
    ];

    offsets.forEach((config, idx) => {
        lines.push({
            start: config.start,
            p1: { x: config.start.x + config.p1.x, y: config.start.y + config.p1.y },
            p2: { x: config.start.x + config.p2.x, y: config.start.y + config.p2.y },
            end: { x: config.start.x + config.end.x, y: config.start.y + config.end.y },
            name: NAMES[idx],
            parentLineIndex: null,
            branchOptions: null,
            generated: false
        });
    });
}

function getBezierPoint(line, t) {
    if (line.segments) {
        const normalizedT = Math.max(0, Math.min(1, t));
        const segmentPosition = normalizedT * line.segments.length;
        const segmentIndex = Math.min(
            Math.floor(segmentPosition),
            line.segments.length - 1
        );
        const segmentT = normalizedT === 1 ? 1 : segmentPosition - segmentIndex;
        return getCubicBezierPoint(line.segments[segmentIndex], segmentT);
    }

    return getCubicBezierPoint(line, t);
}

function getCurveParameterAtProgress(line, progress) {
    if (!line.pathLengthTable) {
        const sampleCount = line.segments ? line.segments.length * 120 : 240;
        const table = [{ t: 0, length: 0 }];
        let previousPoint = getBezierPoint(line, 0);
        let length = 0;

        for (let i = 1; i <= sampleCount; i++) {
            const t = i / sampleCount;
            const point = getBezierPoint(line, t);
            length += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
            table.push({ t, length });
            previousPoint = point;
        }

        line.pathLengthTable = table;
        line.pathLength = length;
    }

    const targetLength = Math.max(0, Math.min(1, progress)) * line.pathLength;
    const table = line.pathLengthTable;
    let low = 0;
    let high = table.length - 1;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (table[middle].length < targetLength) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }

    const upper = table[low];
    const lower = table[Math.max(0, low - 1)];
    const lengthSpan = upper.length - lower.length || 1;
    const fraction = (targetLength - lower.length) / lengthSpan;
    return lower.t + (upper.t - lower.t) * fraction;
}

function getCubicBezierPoint(segment, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    let x = uuu * segment.start.x + 3 * uu * t * segment.p1.x + 3 * u * tt * segment.p2.x + ttt * segment.end.x;
    let y = uuu * segment.start.y + 3 * uu * t * segment.p1.y + 3 * u * tt * segment.p2.y + ttt * segment.end.y;

    return { x, y };
}

function getBezierNormal(line, t) {
    const delta = 0.001;
    const t1 = Math.max(0, t - delta);
    const t2 = Math.min(1, t + delta);

    const p1 = getBezierPoint(line, t1);
    const p2 = getBezierPoint(line, t2);

    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let len = Math.hypot(dx, dy) || 1;

    return { x: -dy / len, y: dx / len };
}

function getDistanceToCurveRange(point, line, minT, maxT) {
    let minSqDist = Infinity;
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
        const t = minT + (i / steps) * (maxT - minT);
        const pt = getBezierPoint(line, t);
        const dx = pt.x - point.x;
        const dy = pt.y - point.y;
        const sqDist = dx * dx + dy * dy;
        if (sqDist < minSqDist) minSqDist = sqDist;
    }
    return Math.sqrt(minSqDist);
}

function getMapBounds() {
    const bounds = {
        minX: centerBox.x,
        minY: centerBox.y,
        maxX: centerBox.x + centerBox.width,
        maxY: centerBox.y + centerBox.height
    };
    const includePoint = (x, y) => {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
    };

    lines.forEach(line => {
        for (let step = 0; step <= 40; step++) {
            const point = getBezierPoint(line, step / 40);
            includePoint(point.x, point.y);
        }

        if (line.nameVisible) {
            const nameLayout = getNameLayout(line);
            includePoint(nameLayout.x - (nameLayout.metrics.actualBoundingBoxLeft || 0), nameLayout.y - (nameLayout.metrics.actualBoundingBoxAscent || 45));
            includePoint(nameLayout.right, nameLayout.y + (nameLayout.metrics.actualBoundingBoxDescent || 0));
        }
    });

    return bounds;
}

function update() {
    animProgress += (targetAnimProgress - animProgress) * 0.007;

    if (isMapView) {
        // Keep the map transform fixed while the camera eases into place.
    } else if (activeLineIndex !== -1) {
        const line = lines[activeLineIndex];
        let currentPos;

        if (animProgress <= 0.6) {
            const bezierT = getCurveParameterAtProgress(line, animProgress / 0.6);
            currentPos = getBezierPoint(line, bezierT);
        } else {
            const textProgress = (animProgress - 0.6) / 0.4;
            const totalWidth = getNameWidth(line.name);
            
            currentPos = {
                x: line.end.x + (totalWidth * textProgress * 0.5),
                y: line.end.y
            };
        }

        targetCamera.x = width / 2 - currentPos.x;
        targetCamera.y = height / 2 - currentPos.y;
    } else {
        targetCamera.x = 0;
        targetCamera.y = 0;
    }

    camera.x += (targetCamera.x - camera.x) * 0.035;
    camera.y += (targetCamera.y - camera.y) * 0.035;
    zoom += (targetZoom - zoom) * 0.035;

    if (activeLineIndex !== -1 && animProgress >= 0.99) {
        lines[activeLineIndex].nameVisible = true;
        activeBranchOptions = getAvailableBranchOptions(lines[activeLineIndex]);
    }
}

// Dibujar la cinta completa (100% de la curva)
function drawRibbon(line, isHovered, isActive, revealProgress = 1) {
    const steps = 120;
    const leftPoints = [];
    const rightPoints = [];
    const revealT = Math.max(0.001, Math.min(1, revealProgress));
    const visibleSteps = Math.max(2, Math.ceil(steps * revealT));

    for (let i = 0; i <= visibleSteps; i++) {
        const progress = i / visibleSteps;
        const t = getCurveParameterAtProgress(line, progress * revealT);
        const pt = getBezierPoint(line, t);
        const norm = getBezierNormal(line, t);

        let widthProfile = 5.5;
        if (line.startsAtName && t < 0.035) {
            const startProgress = t / 0.035;
            const smoothStart = startProgress * startProgress * (3 - 2 * startProgress);
            widthProfile *= smoothStart;
        }
        if (t > 0.97) {
            const endProgress = (t - 0.97) / 0.03;
            const smoothEnd = endProgress * endProgress * (3 - 2 * endProgress);
            widthProfile *= 1 - smoothEnd;
        }
        if (isActive && revealT < 1 && progress > 0.96) {
            const tipProgress = (1 - progress) / 0.04;
            const smoothTip = tipProgress * tipProgress * (3 - 2 * tipProgress);
            widthProfile *= smoothTip;
        }

        leftPoints.push({
            x: pt.x + norm.x * widthProfile,
            y: pt.y + norm.y * widthProfile
        });
        rightPoints.push({
            x: pt.x - norm.x * widthProfile,
            y: pt.y - norm.y * widthProfile
        });
    }

    ctx.fillStyle = '#E41E2B';
    if (isHovered) {
        ctx.shadowColor = 'rgba(228, 30, 43, 0.4)';
        ctx.shadowBlur = 12;
    }

    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < leftPoints.length; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }
    for (let i = rightPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(zoom, zoom);

    // Cuadrado central
    ctx.strokeStyle = '#E41E2B';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(228, 30, 43, 0.15)';
    ctx.shadowBlur = 20;
    ctx.fillRect(centerBox.x, centerBox.y, centerBox.width, centerBox.height);
    ctx.strokeRect(centerBox.x, centerBox.y, centerBox.width, centerBox.height);
    ctx.shadowBlur = 0;

    ctx.save();
    const question = '¿cuál es tu nombre?';
    const questionFontSize = 90;
    ctx.font = `700 ${questionFontSize}px "Great Vibes", "Pacifico", cursive`;
    const questionWidth = ctx.measureText(question).width;
    const fittedFontSize = Math.min(
        questionFontSize,
        questionFontSize * (centerBox.width - 40) / questionWidth
    );
    ctx.font = `700 ${fittedFontSize}px "Great Vibes", "Pacifico", cursive`;
    ctx.fillStyle = '#E41E2B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        question,
        centerBox.x + centerBox.width / 2,
        centerBox.y + centerBox.height / 2
    );
    ctx.restore();

    // Dibuja las 12 líneas permanentemente
    lines.forEach((line, index) => {
        const isHovered = (index === hoveredLineIndex);
        const isActive = (index === activeLineIndex);

        if (!line.generated && !line.startsAtName) {
            drawLinePreview(line, isHovered);
            return;
        }

        const revealProgress = isActive && animProgress < 0.6
            ? animProgress / 0.6
            : 1;
        drawRibbon(line, isHovered, isActive, revealProgress);

        // Si la línea fue seleccionada y se avanzó en la animación, se escribe el nombre
        if ((isActive && animProgress > 0.6) || line.nameVisible) {
            const textProgress = (animProgress - 0.6) / 0.4;

            ctx.save();
            ctx.font = '700 90px "Great Vibes", "Pacifico", cursive';
            ctx.fillStyle = '#E41E2B';
            ctx.strokeStyle = '#E41E2B';
            ctx.lineWidth = 1.2;
            ctx.textBaseline = 'middle';

            const fullText = line.name;
            const nameLayout = getNameLayout(line);
            const textX = nameLayout.x;
            const textY = nameLayout.y;

            if (isActive && !isMapView) {
                ctx.beginPath();
                ctx.rect(
                    nameLayout.left - 2,
                    textY - 100,
                    (nameLayout.right - nameLayout.left + 50) * textProgress,
                    200
                );
                ctx.clip();
            }

            ctx.fillText(fullText, textX, textY);
            ctx.strokeText(fullText, textX, textY);

            ctx.restore();
        }
    });

    if (!isMapView && activeLineIndex !== -1 && animProgress >= 0.99) {
        drawBranchOptions();
    }

    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function navigateToPreviousLine(line) {
    if (line.parentLineIndex === null) {
        resetCamera();
        return;
    }

    activeLineIndex = line.parentLineIndex;
    animProgress = 1;
    targetAnimProgress = 1;
    targetZoom = 1;
    isMapView = false;
    activeBranchOptions = getAvailableBranchOptions(lines[activeLineIndex]);
    hoveredBranchOptionIndex = -1;
    backBtn.classList.remove('hidden');
    mapBtn.classList.remove('hidden');
    mapBtn.textContent = 'Mirar mapa';
}

function focusLineFromMap(lineIndex) {
    activeLineIndex = lineIndex;
    animProgress = 1;
    targetAnimProgress = 1;
    targetZoom = 1;
    isMapView = false;
    activeBranchOptions = getAvailableBranchOptions(lines[lineIndex]);
    hoveredBranchOptionIndex = -1;
    backBtn.classList.remove('hidden');
    mapBtn.classList.remove('hidden');
    mapBtn.textContent = 'Mirar mapa';
}

// Eventos de interacción
canvas.addEventListener('mousemove', (e) => {
    const mousePos = {
        x: (e.clientX - camera.x) / zoom,
        y: (e.clientY - camera.y) / zoom
    };
    hoveredLineIndex = -1;
    hoveredBranchOptionIndex = -1;

    if (isMapView) {
        canvas.style.cursor = getMapNameAt(mousePos) !== -1 ? 'pointer' : 'default';
        return;
    } else if (activeLineIndex === -1) {
        // En el centro: clic/hover sobre el inicio de cualquier línea cerca del cuadrado
        for (let i = 0; i < lines.length; i++) {
            if (getDistanceToCurveRange(mousePos, lines[i], 0, 0.15) < 25) {
                hoveredLineIndex = i;
                break;
            }
        }
    } else {
        const currentActiveLine = lines[activeLineIndex];
        if (animProgress >= 0.99) {
            hoveredBranchOptionIndex = getBranchOptionAt(mousePos);
        }

        // En la vista enfocada: hover sobre la cinta previa al nombre para regresar
        if (getDistanceToCurveRange(mousePos, currentActiveLine, 0, 0.95) < 30) {
            hoveredLineIndex = activeLineIndex;
        }
    }

    canvas.style.cursor = hoveredLineIndex !== -1 || hoveredBranchOptionIndex !== -1
        ? 'pointer'
        : 'default';
});

canvas.addEventListener('click', (e) => {
    const mousePos = {
        x: (e.clientX - camera.x) / zoom,
        y: (e.clientY - camera.y) / zoom
    };

    if (isMapView) {
        const nameIndex = getMapNameAt(mousePos);
        if (nameIndex !== -1) {
            focusLineFromMap(nameIndex);
        }
        return;
    }

    if (activeLineIndex === -1) {
        for (let i = 0; i < lines.length; i++) {
            if (getDistanceToCurveRange(mousePos, lines[i], 0, 0.15) < 30) {
                activeLineIndex = i;
                generateInitialLine(lines[i]);
                lines[i].nameVisible = false;
                animProgress = 0;
                targetAnimProgress = 1;
                activeBranchOptions = getAvailableBranchOptions(lines[i]);
                backBtn.classList.remove('hidden');
                mapBtn.classList.remove('hidden');
                break;
            }
        }
    } else {
        const currentActiveLine = lines[activeLineIndex];
        if (animProgress >= 0.99) {
            const branchOptionIndex = getBranchOptionAt(mousePos);
            if (branchOptionIndex !== -1) {
                createBranchLine(currentActiveLine, activeBranchOptions[branchOptionIndex]);
                return;
            }
        }

        // Solo vuelve si haces clic sobre la cinta seleccionada
        if (getDistanceToCurveRange(mousePos, currentActiveLine, 0, 0.95) < 35) {
            navigateToPreviousLine(currentActiveLine);
        }
    }
});

function resetCamera() {
    activeLineIndex = -1;
    targetAnimProgress = 0;
    targetZoom = 1;
    isMapView = false;
    activeBranchOptions = [];
    backBtn.classList.add('hidden');
    mapBtn.classList.add('hidden');
    mapBtn.textContent = 'Mirar mapa';
}

backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetCamera();
});

mapBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMapView = !isMapView;
    mapBtn.textContent = isMapView ? 'Volver a la línea' : 'Mirar mapa';

    if (isMapView) {
        const bounds = getMapBounds();
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;
        targetZoom = Math.min(
            (width - 80) / boundsWidth,
            (height - 80) / boundsHeight,
            1
        );
        targetCamera.x = width / 2 - ((bounds.minX + bounds.maxX) / 2) * targetZoom;
        targetCamera.y = height / 2 - ((bounds.minY + bounds.maxY) / 2) * targetZoom;
    } else {
        targetZoom = 1;
    }
});

window.addEventListener('resize', resize);

// Inicialización
resize();
loop();