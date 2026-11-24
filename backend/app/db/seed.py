from decimal import Decimal

from sqlmodel import Session, col, select
from app.modules.pedidos.model import (
    DetallePedido,
    Pedido,
)

from app.core.config import settings
from app.core.database import (
    create_db_and_tables,
    engine,
)
from app.core.security import hash_password

from app.modules.categorias.model import Categoria
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario


CATEGORIAS_SEED: tuple[
    tuple[str, str],
    ...,
] = (
    (
        "Bebidas",
        "Bebidas frías y calientes",
    ),
    (
        "Almacén",
        "Productos de almacén",
    ),
    (
        "Snacks",
        "Snacks dulces y salados",
    ),
)


PRODUCTOS_SEED: tuple[
    tuple[
        str,          # nombre
        str,          # descripcion
        str,          # precio
        int,          # stock
        bool,         # disponible
        str,          # categoria
        str | None,   # imagen_url
    ],
    ...,
] = (
    (
        "Café molido",
        "Paquete de café molido de 500 g",
        "8750.00",
        20,
        True,
        "Bebidas",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    ),
    (
        "Té negro",
        "Caja de té negro",
        "3200.00",
        30,
        True,
        "Bebidas",
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574",
    ),
    (
        "Agua mineral",
        "Botella de agua mineral",
        "1500.00",
        50,
        True,
        "Bebidas",
        "https://images.unsplash.com/photo-1564419320408-38e24e038739",
    ),
    (
        "Arroz largo fino",
        "Paquete de arroz de 1 kg",
        "2100.00",
        25,
        True,
        "Almacén",
        "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    ),
    (
        "Fideos secos",
        "Paquete de fideos de 500 g",
        "1800.00",
        35,
        True,
        "Almacén",
        "https://images.unsplash.com/photo-1551462147-ff29053bfc14",
    ),
    (
        "Galletitas",
        "Paquete de galletitas dulces",
        "2700.00",
        18,
        True,
        "Snacks",
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
    ),
    (
        "Papas fritas",
        "Paquete de papas fritas",
        "3500.00",
        15,
        True,
        "Snacks",
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
    ),
    (
        "Barra de cereal",
        "Barra de cereal individual",
        "1200.00",
        40,
        True,
        "Snacks",
        "https://felfort.com.ar/wp-content/uploads/2026/06/3_0900.jpg",
    ),
)


def seed_admin(
    session: Session,
) -> Usuario:
    username = (
        settings.initial_admin_username
        .strip()
        .lower()
    )

    statement = select(Usuario).where(
        col(Usuario.username)
        == username
    )

    usuario = session.exec(
        statement
    ).first()

    if usuario is None:
        usuario = Usuario(
            username=username,
            full_name=(
                settings.initial_admin_full_name
            ),
            email=str(
                settings.initial_admin_email
            ).strip().lower(),
            hashed_password=hash_password(
                settings.initial_admin_password
            ),
            role="admin",
            disabled=False,
        )

        session.add(usuario)
        session.flush()

    return usuario


def seed_categorias(
    session: Session,
) -> dict[str, Categoria]:
    categorias: dict[
        str,
        Categoria,
    ] = {}

    for (
        nombre,
        descripcion,
    ) in CATEGORIAS_SEED:
        statement = select(
            Categoria
        ).where(
            col(Categoria.nombre)
            == nombre
        )

        categoria = session.exec(
            statement
        ).first()

        if categoria is None:
            categoria = Categoria(
                nombre=nombre,
                descripcion=descripcion,
                activo=True,
            )

            session.add(categoria)
            session.flush()

        categorias[nombre] = categoria

    return categorias


def seed_productos(
    session: Session,
    categorias: dict[str, Categoria],
) -> None:
    for (
        nombre,
        descripcion,
        precio,
        stock,
        disponible,
        nombre_categoria,
        imagen_url,
    ) in PRODUCTOS_SEED:

        statement = select(
            Producto
        ).where(
            col(Producto.nombre)
            == nombre
        )

        producto = session.exec(
            statement
        ).first()

        if producto is not None:
            continue

        categoria = categorias[
            nombre_categoria
        ]

        if categoria.id is None:
            raise RuntimeError(
                "La categoría del seed "
                "no está persistida"
            )

        session.add(
            Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio_base=Decimal(
                    precio
                ),
                imagen_url=imagen_url,
                stock=stock,
                disponible=disponible,
                activo=True,
                categoria_id=categoria.id,
            )
        )


def run_seed() -> None:
    create_db_and_tables()

    with Session(
        engine,
        expire_on_commit=False,
    ) as session:
        try:
            seed_admin(session)

            categorias = (
                seed_categorias(
                    session
                )
            )

            seed_productos(
                session=session,
                categorias=categorias,
            )

            session.commit()

        except Exception:
            session.rollback()
            raise


if __name__ == "__main__":
    run_seed()

    print(
        "Seed ejecutado correctamente"
    )