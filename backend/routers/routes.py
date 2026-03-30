from collections import defaultdict
from math import sqrt

from fastapi import APIRouter, Query

from db import get_connection
from schemas import (
    JourneyPlanResponse,
    JourneyStep,
    RouteNetworkItem,
    RouteStopPoint,
    RouteSummary,
    RouteVehicleSnapshot,
)

router = APIRouter()

TRANSFER_LINKS = [
    ("Majestic Metro", "Majestic Bus Stand", 1.2),
    ("Mahatma Gandhi Road", "MG Road", 1.2),
    ("Yelachenahalli", "R V Road", 2.4),
    ("Mysore Road", "Majestic Bus Stand", 2.8),
]
TRANSFER_DISTANCE_THRESHOLD = 0.02


def _normalize(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() or char.isspace() else " " for char in value.strip())
    return " ".join(cleaned.split())


def _match_score(input_value: str, stop_name: str) -> int:
    text = _normalize(input_value)
    name = _normalize(stop_name)
    if not text:
        return 0
    if text == name:
        return 12
    if text in name or name in text:
        return 8

    tokens = [token for token in text.split(" ") if token]
    matches = sum(1 for token in tokens if token in name)
    return matches * 2


def _distance(first: tuple[float, float], second: tuple[float, float]) -> float:
    return sqrt((first[0] - second[0]) ** 2 + (first[1] - second[1]) ** 2)


def _fetch_route_network() -> list[RouteNetworkItem]:
    route_query = """
        SELECT r.route_id,
               r.route_code,
               r.route_name,
               r.mode_type,
               r.total_distance_km,
               v.vehicle_code,
               lt.latitude,
               lt.longitude,
               lt.seats_available,
               lt.delay_minutes,
               lt.delay_status
        FROM routes r
        LEFT JOIN vehicles v ON v.route_id = r.route_id AND v.vehicle_status = 'ACTIVE'
        LEFT JOIN live_tracking lt ON lt.vehicle_id = v.vehicle_id
        WHERE r.route_status = 'ACTIVE'
        ORDER BY r.route_code
    """

    stop_query = """
        SELECT r.route_id,
               s.stop_id,
               s.stop_code,
               s.stop_name,
               rs.stop_sequence,
               s.latitude,
               s.longitude
        FROM route_stops rs
        JOIN routes r ON r.route_id = rs.route_id
        JOIN stops s ON s.stop_id = rs.stop_id
        WHERE r.route_status = 'ACTIVE'
        ORDER BY r.route_code, rs.stop_sequence
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(route_query)
            route_rows = cursor.fetchall()

            cursor.execute(stop_query)
            stop_rows = cursor.fetchall()

    stops_by_route: dict[int, list[RouteStopPoint]] = defaultdict(list)
    for row in stop_rows:
        stops_by_route[int(row[0])].append(
            RouteStopPoint(
                stop_id=int(row[1]),
                stop_code=row[2],
                stop_name=row[3],
                stop_sequence=int(row[4]),
                latitude=float(row[5]),
                longitude=float(row[6]),
            )
        )

    network = []
    for row in route_rows:
        network.append(
            RouteNetworkItem(
                route_id=int(row[0]),
                route_code=row[1],
                route_name=row[2],
                mode_type=row[3],
                total_distance_km=float(row[4]) if row[4] is not None else None,
                stops=stops_by_route[int(row[0])],
                vehicle=RouteVehicleSnapshot(
                    vehicle_code=row[5],
                    latitude=float(row[6]) if row[6] is not None else None,
                    longitude=float(row[7]) if row[7] is not None else None,
                    seats_available=int(row[8]) if row[8] is not None else None,
                    delay_minutes=int(row[9]) if row[9] is not None else None,
                    delay_status=row[10],
                ) if row[5] is not None else None,
            )
        )

    return network


@router.get("", response_model=list[RouteSummary])
def list_routes():
    network = _fetch_route_network()
    return [
        RouteSummary(
            route_id=route.route_id,
            route_code=route.route_code,
            route_name=route.route_name,
            mode_type=route.mode_type,
            total_distance_km=route.total_distance_km,
        )
        for route in network
    ]


@router.get("/network", response_model=list[RouteNetworkItem])
def route_network():
    return _fetch_route_network()


@router.get("/plan", response_model=JourneyPlanResponse | None)
def plan_route(
    from_stop: str = Query(..., alias="from"),
    to_stop: str = Query(..., alias="to"),
):
    network = _fetch_route_network()

    nodes: list[dict] = []
    edges: dict[str, list[dict]] = defaultdict(list)

    def add_edge(source: str, target: str, kind: str, weight: float) -> None:
        edges[source].append({"to": target, "kind": kind, "weight": weight})

    for route in network:
        for index, stop in enumerate(route.stops):
            nodes.append(
                {
                    "id": f"{route.route_code}:{index}",
                    "route_code": route.route_code,
                    "route_name": route.route_name,
                    "mode_type": route.mode_type,
                    "stop_name": stop.stop_name,
                    "pos": (stop.latitude, stop.longitude),
                    "index": index,
                }
            )

    for route in network:
        for index in range(len(route.stops) - 1):
            current_id = f"{route.route_code}:{index}"
            next_id = f"{route.route_code}:{index + 1}"
            add_edge(current_id, next_id, "ride", 1)
            add_edge(next_id, current_id, "ride", 1)

    for first_index in range(len(nodes)):
        for second_index in range(first_index + 1, len(nodes)):
            first = nodes[first_index]
            second = nodes[second_index]
            if first["route_code"] == second["route_code"]:
                continue

            same_name = _normalize(first["stop_name"]) == _normalize(second["stop_name"])
            nearby = _distance(first["pos"], second["pos"]) <= TRANSFER_DISTANCE_THRESHOLD
            if same_name or nearby:
                weight = 1.4 if same_name else 2.1
                add_edge(first["id"], second["id"], "walk", weight)
                add_edge(second["id"], first["id"], "walk", weight)

    for from_name, to_name, weight in TRANSFER_LINKS:
        from_nodes = [node for node in nodes if _normalize(node["stop_name"]) == _normalize(from_name)]
        to_nodes = [node for node in nodes if _normalize(node["stop_name"]) == _normalize(to_name)]
        for first in from_nodes:
            for second in to_nodes:
                add_edge(first["id"], second["id"], "walk", weight)
                add_edge(second["id"], first["id"], "walk", weight)

    origin_candidates = [
        {"node": node, "score": _match_score(from_stop, node["stop_name"])}
        for node in nodes
    ]
    origin_candidates = sorted(
        [candidate for candidate in origin_candidates if candidate["score"] > 0],
        key=lambda candidate: candidate["score"],
        reverse=True,
    )[:5]

    destination_candidates = [
        {"node": node, "score": _match_score(to_stop, node["stop_name"])}
        for node in nodes
    ]
    destination_candidates = sorted(
        [candidate for candidate in destination_candidates if candidate["score"] > 0],
        key=lambda candidate: candidate["score"],
        reverse=True,
    )[:5]

    if not origin_candidates or not destination_candidates:
        return None

    destination_ids = {candidate["node"]["id"] for candidate in destination_candidates}
    costs: dict[str, float] = {}
    previous: dict[str, dict] = {}
    visited: set[str] = set()
    queue: list[dict] = []

    for index, candidate in enumerate(origin_candidates):
        start_cost = index * 0.05
        node_id = candidate["node"]["id"]
        costs[node_id] = start_cost
        queue.append({"id": node_id, "cost": start_cost})

    found_destination_id = None

    while queue:
        queue.sort(key=lambda item: item["cost"])
        current = queue.pop(0)
        if current["id"] in visited:
            continue

        visited.add(current["id"])
        if current["id"] in destination_ids:
            found_destination_id = current["id"]
            break

        for edge in edges.get(current["id"], []):
            next_cost = current["cost"] + edge["weight"]
            if next_cost < costs.get(edge["to"], float("inf")):
                costs[edge["to"]] = next_cost
                previous[edge["to"]] = {"from": current["id"], "edge": edge}
                queue.append({"id": edge["to"], "cost": next_cost})

    if found_destination_id is None:
        return None

    node_by_id = {node["id"]: node for node in nodes}
    path_ids = [found_destination_id]
    while path_ids[0] in previous:
        path_ids.insert(0, previous[path_ids[0]]["from"])

    path_nodes = [node_by_id[node_id] for node_id in path_ids]
    steps: list[JourneyStep] = []

    for index in range(len(path_nodes) - 1):
        current = path_nodes[index]
        nxt = path_nodes[index + 1]
        edge = previous.get(nxt["id"], {}).get("edge")
        if edge is None:
            continue

        if edge["kind"] == "ride":
            last_step = steps[-1] if steps else None
            if last_step and last_step.kind == "ride" and last_step.route_code == current["route_code"]:
                last_step.to_stop = nxt["stop_name"]
                last_step.stop_count = (last_step.stop_count or 1) + 1
            else:
                steps.append(
                    JourneyStep(
                        kind="ride",
                        route_code=current["route_code"],
                        route_name=current["route_name"],
                        mode_type=current["mode_type"],
                        from_stop=current["stop_name"],
                        to_stop=nxt["stop_name"],
                        stop_count=1,
                    )
                )
        else:
            steps.append(
                JourneyStep(
                    kind="walk",
                    from_stop=current["stop_name"],
                    to_stop=nxt["stop_name"],
                )
            )

    route_codes: list[str] = []
    for step in steps:
        if step.route_code and step.route_code not in route_codes:
            route_codes.append(step.route_code)

    return JourneyPlanResponse(
        from_stop=path_nodes[0]["stop_name"],
        to_stop=path_nodes[-1]["stop_name"],
        route_codes=route_codes,
        steps=steps,
    )
