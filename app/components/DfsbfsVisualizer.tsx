import React, { useState, useRef, useEffect } from 'react'

interface Node {
  id: number
  x: number
  y: number
  label: string
}

interface Edge {
  from: number
  to: number
}

export default function DFSBFSVisualizer() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, x: 300, y: 60, label: '1' },
    { id: 2, x: 180, y: 180, label: '2' },
    { id: 3, x: 420, y: 180, label: '3' },
    { id: 4, x: 120, y: 300, label: '4' },
    { id: 5, x: 240, y: 300, label: '5' },
    { id: 6, x: 360, y: 300, label: '6' }
  ])
  const [edges, setEdges] = useState<Edge[]>([
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 6 }
  ])

  const [selectedNode, setSelectedNode] = useState<number | null>(1)
  const [mode, setMode] = useState<'dfs' | 'bfs'>('dfs')
  const [running, setRunning] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [order, setOrder] = useState<number[]>([])
  const [speed, setSpeed] = useState(600)
  const [shiftPressed, setShiftPressed] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const buildAdj = (): Map<number, number[]> => {
    const adj = new Map<number, number[]>()

    // 1. 노드마다 빈 배열 초기화
    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i].id
      adj.set(nodeId, [])
    }

    // 2. 엣지 연결
    for (let i = 0; i < edges.length; i++) {
      const from = edges[i].from
      const to = edges[i].to
      if (adj.has(from)) {
        adj.get(from)!.push(to)
      }
    }

    return adj
  }

  const resetTraversal = () => {
    setVisited(new Set())
    setOrder([])
    setRunning(false)
  }

  const computeDFSOrder = (start: number): number[] => {
    const adj = buildAdj()          // 1. 인접 리스트 준비
    const stack: number[] = []      // 2. 스택 준비
    const seen = new Set<number>()  // 3. 방문 기록
    const out: number[] = []        // 4. 방문 순서 기록

    stack.push(start)               // 5. 시작 노드 스택에 넣기

    while (stack.length > 0) {      // 6. 스택이 빌 때까지 반복
      const u = stack.pop()!        // 6-1. 스택에서 노드 꺼내기
      if (!seen.has(u)) {           // 6-2. 방문 여부 체크
        seen.add(u)                 // 6-3. 방문 기록
        out.push(u)                 // 6-4. 방문 순서 기록

        // 6-5. 인접 노드를 스택에 추가 (뒤집어서 넣으면 원래 순서 유지 가능)
        const neighbors = adj.get(u) || []
        for (let i = neighbors.length - 1; i >= 0; i--) {
          if (!seen.has(neighbors[i])) {
            stack.push(neighbors[i])
          }
        }
      }
    }

    return out                      // 7. 최종 방문 순서 반환
  }

  const computeBFSOrder = (start: number): number[] => {
    const adj = buildAdj()          // 1. 인접 리스트 준비
    const queue: number[] = []      // 2. 큐 준비
    const seen = new Set<number>()  // 3. 방문 기록
    const out: number[] = []        // 4. 방문 순서 기록

    queue.push(start)               // 5. 시작 노드 큐에 넣기
    seen.add(start)                 // 5-1. 시작 노드 방문 기록

    while (queue.length > 0) {      // 6. 큐가 빌 때까지 반복
      const u = queue.shift()!      // 6-1. 큐에서 노드 꺼내기
      out.push(u)                   // 6-2. 방문 순서 기록

      // 6-3. 인접 노드 처리
      const neighbors = adj.get(u) || []
      for (let i = 0; i < neighbors.length; i++) {
        const v = neighbors[i]
        if (!seen.has(v)) {
          seen.add(v)               // 6-4. 방문 체크
          queue.push(v)             // 6-5. 큐에 추가
        }
      }
    }

    return out                      // 7. 최종 방문 순서 반환
  }

  const animateOrder = async (arr: number[]) => {
    setRunning(true)
    const visitedSet = new Set<number>()
    for (let i = 0; i < arr.length; i++) {
      visitedSet.add(arr[i])
      setVisited(new Set(visitedSet))
      setOrder(arr.slice(0, i + 1))
      await new Promise(r => setTimeout(r, speed))
    }
    setRunning(false)
  }

  const handleRun = () => {
    if (!selectedNode) return
    resetTraversal()
    const arr = mode === 'dfs' ? computeDFSOrder(selectedNode) : computeBFSOrder(selectedNode)
    animateOrder(arr)
  }

  const handleSvgClick = (e: React.MouseEvent) => {
    if (running) return
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newId = nodes.reduce((m, n) => Math.max(m, n.id), 0) + 1
    setNodes(ns => [...ns, { id: newId, x, y, label: String(newId) }])
  }

  const handleNodeDrag = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    const rect = svgRef.current!.getBoundingClientRect()
    const nodeToDrag = nodes.find(n => n.id === id);
    if (!nodeToDrag) return;

    const initialMouseX = e.clientX - rect.left;
    const initialMouseY = e.clientY - rect.top;
    const offsetX = initialMouseX - nodeToDrag.x;
    const offsetY = initialMouseY - nodeToDrag.y;

    const onMove = (mv: MouseEvent) => {
      const currentMouseX = mv.clientX - rect.left;
      const currentMouseY = mv.clientY - rect.top;
      const newX = currentMouseX - offsetX;
      const newY = currentMouseY - offsetY;
      setNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleNodeClick = (nodeId: number) => {
    if (shiftPressed) {
      if (selectedNode === null) {
        setSelectedNode(nodeId)
      } else if (selectedNode !== nodeId) {
        setEdges(prev => [...prev, { from: selectedNode, to: nodeId }])
        setSelectedNode(null)
      }
    } else {
      setSelectedNode(nodeId)
    }
  }

  const sampleTree = () => {
    setNodes([
      { id: 1, x: 300, y: 60, label: '1' },
      { id: 2, x: 180, y: 180, label: '2' },
      { id: 3, x: 420, y: 180, label: '3' },
      { id: 4, x: 120, y: 300, label: '4' },
      { id: 5, x: 240, y: 300, label: '5' },
      { id: 6, x: 360, y: 300, label: '6' }
    ])
    setEdges([
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 }
    ])
    resetTraversal()
    setSelectedNode(1)
  }

  useEffect(() => {
    if (!nodes.some(n => n.id === selectedNode)) {
      setSelectedNode(nodes.length ? nodes[0].id : null)
    }
  }, [nodes, selectedNode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftPressed(true) }
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftPressed(false) }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* 상단 컨트롤 패널 */}
      <div className="flex gap-3 items-center mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">시작 노드</label>
          <select className="border rounded p-1" value={selectedNode ?? ''} onChange={e => setSelectedNode(Number(e.target.value))}>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded text-white disabled:opacity-50 ${mode === 'dfs' ? 'bg-sky-600' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => setMode('dfs')}
            disabled={running}
          >
            DFS
          </button>

          <button
            className={`px-3 py-1 rounded text-white disabled:opacity-50 ${mode === 'bfs' ? 'bg-emerald-600' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => setMode('bfs')}
            disabled={running}
          >
            BFS
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border" onClick={handleRun} disabled={running}>Run</button>
          <button className="px-3 py-1 rounded border" onClick={resetTraversal} disabled={running}>Reset</button>
          <button className="px-3 py-1 rounded border" onClick={sampleTree} disabled={running}>Sample Tree</button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm">속도</label>
          <input type="range" min="100" max="1200" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          <div className="text-xs w-12 text-right">{speed}ms</div>
        </div>
      </div>

      {/* SVG 그래픽 영역 */}
      <div className="border rounded" style={{ height: 420 }}>
        <svg ref={svgRef} onDoubleClick={handleSvgClick} className="w-full h-full" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker
                  id="arrowhead"
                  viewBox="0 0 10 10"
                  refX="9" refY="5"
                  markerWidth="6" markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF" />
                </marker>
              </defs>
          {edges.map((e, i) => {
            const a = nodes.find(n => n.id === e.from)
            const b = nodes.find(n => n.id === e.to)
            if (!a || !b) return null
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const ratio = 20 / dist
            return <line key={i} x1={a.x + dx * ratio} y1={a.y + dy * ratio} x2={b.x - dx * ratio} y2={b.y - dy * ratio} strokeWidth={2} stroke="#9CA3AF" markerEnd="url(#arrowhead)" />
          })}

          {nodes.map(n => {
            const isVisited = visited.has(n.id)
            const isOrderHead = order[order.length - 1] === n.id
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                <circle
                  r={22}
                  cx={0}
                  cy={0}
                  fill={isOrderHead ? '#F59E0B' : isVisited ? '#60A5FA' : '#E5E7EB'}
                  stroke={selectedNode === n.id ? '#111827' : '#9CA3AF'}
                  strokeWidth={selectedNode === n.id ? 3 : 1}
                  onMouseDown={(e) => handleNodeDrag(n.id, e)}
                  onClick={() => handleNodeClick(n.id)}
                  style={{ cursor: 'grab' }}
                />
                <text x={0} y={6} textAnchor="middle" fontSize={12} fill="#111827">{n.label}</text>
                
              </g>
            )
          })}
        </svg>
      </div>
      <div className="text-xs mt-2">Tip: Double-click on the SVG area to add a node. Drag nodes to adjust their position.</div>
      <div className="text-xs mt-2">After selecting a node, Shift-click another node to connect them.</div>
    </div>
  )
}